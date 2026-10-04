import { BUILTINS, callMethod } from './builtins'
import { PyError, type PyErrorInfo } from './errors'
import { parse } from './parser'
import type {
  AssignTarget,
  BinOpExpr,
  CompareOp,
  Expr,
  FStringLit,
  Program,
  Stmt,
} from './ast'
import {
  applyFormatSpec,
  compareValues,
  Float,
  isDict,
  isInt,
  isNumber,
  iterate,
  lookupKey,
  numVal,
  pyRepr,
  pyStr,
  pyTypeName,
  setKey,
  truthy,
  valuesEqual,
  type PyDict,
  type PyValue,
} from './values'

/* ------------------------------ control flow ----------------------------- */

export const BREAK = Symbol('break')
export const CONTINUE = Symbol('continue')
export type Signal = typeof BREAK | typeof CONTINUE

/* --------------------------------- events -------------------------------- */

export interface OutputEvent {
  type: 'output'
  text: string
  stream: 'stdout' | 'stderr'
  error?: PyErrorInfo
}

export interface PromptEvent {
  type: 'prompt'
  prompt: string
  /** Index of the input() call, used for cache keys. */
  callId: number
}

export type ExecEvent = OutputEvent | PromptEvent
export type Yielded = ExecEvent | Signal
export type Sent = unknown

export interface InterpreterOptions {
  /** Guard against runaway loops. */
  maxSteps?: number
  maxOutputChars?: number
  /** Called whenever a variable is bound, for the Variable Lab visualisation. */
  onBind?: (name: string, value: PyValue) => void
}

/* ------------------------------- environment ----------------------------- */

interface Frame {
  vars: Map<string, PyValue>
  parent: Frame | null
}

class Env {
  private current: Frame

  constructor(parent: Env | null = null) {
    this.current = { vars: new Map(), parent: parent ? parent.current : null }
  }

  lookup(name: string): PyValue | undefined {
    let frame: Frame | null = this.current
    while (frame) {
      if (frame.vars.has(name)) return frame.vars.get(name)
      frame = frame.parent
    }
    return undefined
  }

  has(name: string): boolean {
    let frame: Frame | null = this.current
    while (frame) {
      if (frame.vars.has(name)) return true
      frame = frame.parent
    }
    return false
  }

  set(name: string, value: PyValue): void {
    this.current.vars.set(name, value)
  }

  assignExisting(name: string, value: PyValue): boolean {
    let frame: Frame | null = this.current
    while (frame) {
      if (frame.vars.has(name)) {
        frame.vars.set(name, value)
        return true
      }
      frame = frame.parent
    }
    return false
  }

  delete(name: string): boolean {
    let frame: Frame | null = this.current
    while (frame) {
      if (frame.vars.has(name)) {
        frame.vars.delete(name)
        return true
      }
      frame = frame.parent
    }
    return false
  }

  child(): Env {
    return new Env(this)
  }

  /** Every binding visible right now — used by the Variable Lab debugger. */
  snapshot(): { name: string; value: PyValue }[] {
    const out: { name: string; value: PyValue }[] = []
    const seen = new Set<string>()
    let frame: Frame | null = this.current
    while (frame) {
      for (const [name, value] of frame.vars) {
        if (!seen.has(name)) {
          seen.add(name)
          out.push({ name, value })
        }
      }
      frame = frame.parent
    }
    return out
  }
}

/* ------------------------------- interpreter ----------------------------- */

const DEFAULT_MAX_STEPS = 400_000

export class Interpreter {
  private readonly gen: Generator<Yielded, void, Sent>
  private readonly program: Program
  private readonly maxSteps: number
  private readonly maxOutputChars: number
  private readonly onBind: ((name: string, value: PyValue) => void) | undefined
  private steps = 0
  private inputCount = 0
  private charsEmitted = 0
  private finished = false
  /** Text queued for the next `input()` call; consumed by the next `next()`. */
  private pendingInput: string | undefined

  constructor(source: string, options: InterpreterOptions = {}) {
    this.program = parse(source)
    this.maxSteps = options.maxSteps ?? DEFAULT_MAX_STEPS
    this.maxOutputChars = options.maxOutputChars ?? 40_000
    this.onBind = options.onBind
    this.gen = this.run()
  }

  /* ------------------------------ public driver --------------------------- */

  /**
   * Advance execution until the program finishes or asks for input.
   * Returns the events produced along the way.
   */
  runUntilBlocked(): ExecEvent[] {
    const events: ExecEvent[] = []
    if (this.finished) return events

    for (;;) {
      let result: IteratorResult<Yielded, void>
      const sent = this.pendingInput
      this.pendingInput = undefined
      try {
        result = this.gen.next(sent)
      } catch (err) {
        this.finished = true
        // Surface the error as a stderr event so the UI has a single code path.
        const error =
          err instanceof PyError
            ? err
            : new PyError('RuntimeError', err instanceof Error ? err.message : String(err))
        events.push({
          type: 'output',
          text: `${error.kind}: ${error.message}`,
          stream: 'stderr',
          error: error.toInfo(),
        })
        return events
      }

      if (result.done) {
        this.finished = true
        return events
      }

      const value = result.value
      if (value === BREAK || value === CONTINUE) {
        this.finished = true
        return events
      }

      events.push(value)
      if (value.type === 'prompt') return events

      this.charsEmitted += value.text.length
      if (this.charsEmitted > this.maxOutputChars) {
        this.finished = true
        this.gen.return()
        events.push({
          type: 'output',
          text: 'Output limit reached — the program was stopped.',
          stream: 'stderr',
        })
        return events
      }
    }
  }

  /** Queue a line of text for the pending `input()` call. */
  provideInput(text: string): void {
    if (this.finished) return
    this.pendingInput = text
  }

  /** Stop the program (used when the user unmounts or resets). */
  cancel(): void {
    this.finished = true
    this.pendingInput = undefined
    try {
      this.gen.return()
    } catch {
      /* already finished */
    }
  }

  /* ------------------------------ execution core -------------------------- */

  private *run(): Generator<Yielded, void, Sent> {
    const env = new Env()
    try {
      yield* this.execBlock(this.program.body, env)
    } catch (err) {
      if (err === BREAK || err === CONTINUE) return
      throw err
    }
  }

  private tick(line: number): void {
    if (++this.steps > this.maxSteps) {
      throw new PyError(
        'RuntimeError',
        'This program ran too long and was stopped. Check for a loop that never ends.',
        line,
      )
    }
  }

  private bind(name: string, value: PyValue): void {
    this.onBind?.(name, value)
  }

  /** Store `value` into an assignment target (name, unpack, or subscript). */
  private *assign(
    target: AssignTarget,
    value: PyValue,
    env: Env,
    line: number,
  ): Generator<Yielded, void, Sent> {
    if (target.kind === 'name') {
      env.set(target.name, value)
      this.bind(target.name, value)
      return
    }

    if (target.kind === 'item') {
      const container = yield* this.eval(target.target, env)
      const key = yield* this.eval(target.index, env)
      if (Array.isArray(container)) {
        const at = this.normaliseIndex(key, container.length, line, 'list')
        if (at < 0 || at >= container.length) {
          throw new PyError('IndexError', 'list assignment index out of range', line)
        }
        container[at] = value
        return
      }
      if (isDict(container)) {
        setKey(container, key, value, line)
        return
      }
      throw new PyError(
        'TypeError',
        `'${pyTypeName(container)}' object does not support item assignment`,
        line,
      )
    }

    // Tuple / list unpacking
    const items = iterate(value, line)
    if (items.length !== target.names.length) {
      throw new PyError(
        'ValueError',
        items.length < target.names.length
          ? `not enough values to unpack (expected ${target.names.length}, got ${items.length})`
          : `too many values to unpack (expected ${target.names.length})`,
        line,
      )
    }
    target.names.forEach((name, index) => {
      env.set(name, items[index] as PyValue)
      this.bind(name, items[index] as PyValue)
    })
  }

  /** Read the current value of an assignment target. */
  private *readTarget(
    target: AssignTarget,
    env: Env,
    line: number,
  ): Generator<Yielded, PyValue, Sent> {
    if (target.kind === 'name') {
      if (!env.has(target.name)) {
        throw new PyError('NameError', `name '${target.name}' is not defined`, line)
      }
      return env.lookup(target.name) as PyValue
    }
    if (target.kind === 'item') {
      const container = yield* this.eval(target.target, env)
      const key = yield* this.eval(target.index, env)
      return this.index(container, key, line)
    }
    throw new PyError('SyntaxError', 'cannot read this assignment target', line)
  }

  private *bindLoopTarget(
    names: string[],
    item: PyValue,
    env: Env,
    line: number,
  ): Generator<Yielded, void, Sent> {
    if (names.length === 1) {
      env.set(names[0] as string, item)
      this.bind(names[0] as string, item)
      return
    }
    const parts = iterate(item, line)
    if (parts.length !== names.length) {
      throw new PyError(
        'ValueError',
        parts.length < names.length
          ? `not enough values to unpack (expected ${names.length}, got ${parts.length})`
          : `too many values to unpack (expected ${names.length})`,
        line,
      )
    }
    names.forEach((name, i) => {
      env.set(name, parts[i] as PyValue)
      this.bind(name, parts[i] as PyValue)
    })
  }

  private *execBlock(body: Stmt[], env: Env): Generator<Yielded, Signal | null, Sent> {
    for (const stmt of body) {
      const signal = yield* this.execStatement(stmt, env)
      if (signal) return signal
    }
    return null
  }

  private *execStatement(stmt: Stmt, env: Env): Generator<Yielded, Signal | null, Sent> {
    this.tick(stmt.line)

    switch (stmt.kind) {
      case 'ExprStmt': {
        yield* this.eval(stmt.expr, env)
        return null
      }

      case 'AssignStmt': {
        const value = yield* this.eval(stmt.value, env)
        for (const target of stmt.targets) {
          yield* this.assign(target, value, env, stmt.line)
        }
        return null
      }

      case 'AugAssignStmt': {
        const current = yield* this.readTarget(stmt.target, env, stmt.line)
        const rhs = yield* this.eval(stmt.value, env)
        const next = this.binaryOp(stmt.op, current, rhs, stmt.line)
        yield* this.assign(stmt.target, next, env, stmt.line)
        return null
      }

      case 'IfStmt': {
        const test = yield* this.eval(stmt.test, env)
        const taken = truthy(test) ? stmt.body : stmt.orelse
        // Python blocks are not scopes: assignments inside an `if` body stay
        // visible afterwards, so the same environment is reused.
        if (taken.length > 0) return yield* this.execBlock(taken, env)
        return null
      }

      case 'WhileStmt': {
        for (;;) {
          this.tick(stmt.line)
          const test = yield* this.eval(stmt.test, env)
          if (!truthy(test)) break
          const signal = yield* this.execBlock(stmt.body, env)
          if (signal === BREAK) break
        }
        return null
      }

      case 'ForStmt': {
        const iterable = yield* this.eval(stmt.iter, env)
        const items = iterate(iterable, stmt.line)
        for (const item of items) {
          this.tick(stmt.line)
          yield* this.bindLoopTarget(stmt.target, item, env, stmt.line)
          const signal = yield* this.execBlock(stmt.body, env)
          if (signal === BREAK) break
        }
        return null
      }

      case 'BreakStmt':
        return BREAK

      case 'ContinueStmt':
        return CONTINUE

      case 'PassStmt':
        return null

      case 'UnsupportedStmt':
        throw new PyError(
          'NotImplementedError',
          `${stmt.label} is not available in this playground yet. ${stmt.hint}`,
          stmt.line,
        )

      default:
        return null
    }
  }

  /* ------------------------------ expressions ---------------------------- */

  private *eval(expr: Expr, env: Env): Generator<Yielded, PyValue, Sent> {
    this.tick(expr.line)

    switch (expr.kind) {
      case 'NumberLit':
        return expr.value
      case 'StringLit':
        return expr.value
      case 'BoolLit':
        return expr.value
      case 'NoneLit':
        return null

      case 'FStringLit':
        return yield* this.evalFString(expr, env)

      case 'NameExpr': {
        if (env.has(expr.name)) return env.lookup(expr.name) as PyValue
        throw new PyError(
          'NameError',
          `name '${expr.name}' is not defined`,
          expr.line,
        )
      }

      case 'ListLit': {
        const items: PyValue[] = []
        for (const element of expr.elements) items.push(yield* this.eval(element, env))
        return items
      }

      case 'TupleLit': {
        const items: PyValue[] = []
        for (const element of expr.elements) items.push(yield* this.eval(element, env))
        return items
      }

      case 'SetLit': {
        const dict: PyDict = new Map()
        for (const element of expr.elements) {
          setKey(dict, yield* this.eval(element, env), true, expr.line)
        }
        return dict
      }

      case 'DictLit': {
        const dict: PyDict = new Map()
        for (const entry of expr.entries) {
          const key = yield* this.eval(entry.key, env)
          const value = yield* this.eval(entry.value, env)
          setKey(dict, key, value, expr.line)
        }
        return dict
      }

      case 'Comprehension': {
        const iterable = yield* this.eval(expr.iter, env)
        const items = iterate(iterable, expr.line)
        const scope = env.child()
        const out: PyValue[] = []
        for (const item of items) {
          this.tick(expr.line)
          scope.set(expr.target, item)
          if (expr.test) {
            const keep = yield* this.eval(expr.test, scope)
            if (!truthy(keep)) continue
          }
          out.push(yield* this.eval(expr.element, scope))
        }
        return out
      }

      case 'UnaryExpr': {
        const value = yield* this.eval(expr.operand, env)
        if (!isNumber(value)) {
          throw new PyError(
            'TypeError',
            `bad operand type for unary ${expr.op}: '${pyTypeName(value)}'`,
            expr.line,
          )
        }
        const n = numVal(value)
        // Unary minus keeps the operand's numeric type.
        if (expr.op === '-') return value instanceof Float ? new Float(-n) : -n
        if (expr.op === '+') return value
        return ~n
      }

      case 'NotExpr': {
        const value = yield* this.eval(expr.operand, env)
        return !truthy(value)
      }

      case 'BoolExpr': {
        const left = yield* this.eval(expr.left, env)
        if (expr.op === 'and') return truthy(left) ? yield* this.eval(expr.right, env) : left
        return truthy(left) ? left : yield* this.eval(expr.right, env)
      }

      case 'CompareExpr': {
        // Python chains comparisons: `a < b < c` evaluates `a < b and b < c`,
        // reusing the *original* middle operand rather than the bool result.
        let left = yield* this.eval(expr.left, env)
        for (const step of expr.comparators) {
          const right = yield* this.eval(step.expr, env)
          if (!this.compare(step.op, left, right, expr.line)) return false
          left = right
        }
        return true
      }

      case 'TernaryExpr': {
        const test = yield* this.eval(expr.test, env)
        return truthy(test) ? yield* this.eval(expr.body, env) : yield* this.eval(expr.orelse, env)
      }

      case 'BinOpExpr': {
        const left = yield* this.eval(expr.left, env)
        const right = yield* this.eval(expr.right, env)
        return this.binaryOp(expr.op, left, right, expr.line)
      }

      case 'AttrExpr': {
        const target = yield* this.eval(expr.target, env)
        return callMethod(target, expr.attr, [], expr.line)
      }

      case 'IndexExpr': {
        const target = yield* this.eval(expr.target, env)
        const index = yield* this.eval(expr.index, env)
        return this.index(target, index, expr.line)
      }

      case 'SliceExpr': {
        const target = yield* this.eval(expr.target, env)
        const start = expr.start ? yield* this.eval(expr.start, env) : null
        const stop = expr.stop ? yield* this.eval(expr.stop, env) : null
        const step = expr.step ? yield* this.eval(expr.step, env) : null
        return this.slice(target, start, stop, step, expr.line)
      }

      case 'CallExpr':
        return yield* this.call(expr, env)

      default:
        return yield* this.unsupportedExpression(expr)
    }
  }

  private *unsupportedExpression(expr: Expr): Generator<Yielded, PyValue, Sent> {
    throw new PyError('RuntimeError', 'unsupported expression', expr.line)
  }

  private *evalFString(node: FStringLit, env: Env): Generator<Yielded, PyValue, Sent> {
    let out = ''
    for (const part of node.parts) {
      if (part.type === 'literal') {
        out += part.value
        continue
      }
      let value = yield* this.eval(part.expr, env)
      if (part.conversion === 'r') value = pyRepr(value)
      else if (part.conversion === 's') value = pyStr(value)
      else if (part.conversion === 'a') value = pyRepr(value)
      out += part.spec ? applyFormatSpec(value, part.spec, part.line) : pyStr(value)
    }
    return out
  }

  private *call(
    expr: Extract<Expr, { kind: 'CallExpr' }>,
    env: Env,
  ): Generator<Yielded, PyValue, Sent> {
    const { callee } = expr

    // print(...) is special-cased so its output can be streamed line by line.
    if (callee.kind === 'NameExpr' && callee.name === 'print') {
      return yield* this.doPrint(expr, env)
    }

    if (callee.kind === 'NameExpr' && callee.name === 'input') {
      return yield* this.doInput(expr, env)
    }

    const args: PyValue[] = []
    for (const arg of expr.args) args.push(yield* this.eval(arg, env))
    const keywords: [string, PyValue][] = []
    for (const kw of expr.keywords) keywords.push([kw.name, yield* this.eval(kw.value, env)])

    if (callee.kind === 'NameExpr') {
      const name = callee.name
      const builtin = BUILTINS[name]
      if (builtin) {
        if (keywords.length > 0 && name !== 'sorted') {
          throw new PyError(
            'TypeError',
            `${name}() does not take keyword arguments in this playground`,
            expr.line,
          )
        }
        return builtin(args, expr.line, Object.fromEntries(keywords))
      }
      if (env.has(name)) {
        throw new PyError(
          'TypeError',
          `cannot call '${name}'. Functions arrive in Module 3.`,
          expr.line,
        )
      }
      throw new PyError('NameError', `name '${name}' is not defined`, expr.line)
    }

    if (callee.kind === 'AttrExpr') {
      const target = yield* this.eval(callee.target, env)
      return callMethod(target, callee.attr, args, expr.line, Object.fromEntries(keywords))
    }

    const value = yield* this.eval(callee, env)
    if (Array.isArray(value)) {
      return callMethod(value, '__call__', args, expr.line)
    }
    throw new PyError('TypeError', `object is not callable`, expr.line)
  }

  private *doPrint(
    expr: Extract<Expr, { kind: 'CallExpr' }>,
    env: Env,
  ): Generator<Yielded, PyValue, Sent> {
    let sep = ' '
    let end = '\n'
    const positional: PyValue[] = []

    for (const arg of expr.args) positional.push(yield* this.eval(arg, env))

    for (const kw of expr.keywords) {
      const value = yield* this.eval(kw.value, env)
      if (kw.name === 'sep') sep = pyStr(value)
      else if (kw.name === 'end') end = pyStr(value)
      else {
        throw new PyError(
          'TypeError',
          `'${kw.name}' is an invalid keyword argument for print()`,
          expr.line,
        )
      }
    }

    yield { type: 'output', text: positional.map((item) => pyStr(item)).join(sep) + end, stream: 'stdout' }
    return null
  }

  private *doInput(
    expr: Extract<Expr, { kind: 'CallExpr' }>,
    env: Env,
  ): Generator<Yielded, PyValue, Sent> {
    let prompt = ''
    if (expr.args.length > 0) prompt = pyStr(yield* this.eval(expr.args[0] as Expr, env))

    const callId = ++this.inputCount
    if (prompt) yield { type: 'output', text: prompt, stream: 'stdout' }

    const answer = (yield { type: 'prompt', prompt, callId }) as Sent
    return typeof answer === 'string' ? answer : ''
  }

  /* -------------------------------- operators ---------------------------- */

  private binaryOp(op: BinOpExpr['op'], left: PyValue, right: PyValue, line: number): PyValue {
    if (op === '+') {
      if (typeof left === 'string' && typeof right === 'string') return left + right
      if (typeof left === 'string') {
        throw new PyError(
          'TypeError',
          `can only concatenate str (not "${pyTypeName(right)}") to str`,
          line,
        )
      }
      if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right]
      if (isDict(left) && isDict(right)) {
        const merged: PyDict = new Map(left)
        for (const [k, v] of right) merged.set(k, v)
        return merged
      }
      return this.arith(left, right, line, (a, b) => a + b)
    }

    if (op === '*') {
      if (typeof left === 'string' && isNumber(right)) {
        return left.repeat(Math.max(0, Math.trunc(numVal(right))))
      }
      if (isNumber(left) && typeof right === 'string') {
        return right.repeat(Math.max(0, Math.trunc(numVal(left))))
      }
      if (Array.isArray(left) && isNumber(right)) {
        const times = Math.max(0, Math.trunc(numVal(right)))
        const out: PyValue[] = []
        for (let i = 0; i < times; i++) out.push(...left)
        return out
      }
      return this.arith(left, right, line, (a, b) => a * b)
    }

    if (op === '/') {
      const [a, b] = this.numericOperands(left, right, line, '/')
      if (b === 0) throw new PyError('ZeroDivisionError', 'division by zero', line)
      return new Float(a / b)
    }

    if (op === '//') {
      const [a, b] = this.numericOperands(left, right, line, '//')
      if (b === 0) {
        throw new PyError('ZeroDivisionError', 'integer division or modulo by zero', line)
      }
      const result = Math.floor(a / b)
      // Python keeps the float type if either operand is a float.
      return left instanceof Float || right instanceof Float ? new Float(result) : result
    }

    if (op === '%') {
      const [a, b] = this.numericOperands(left, right, line, '%')
      if (b === 0) {
        throw new PyError('ZeroDivisionError', 'integer division or modulo by zero', line)
      }
      const result = a - Math.floor(a / b) * b
      return left instanceof Float || right instanceof Float ? new Float(result) : result
    }

    if (op === '**') {
      const [a, b] = this.numericOperands(left, right, line, '**')
      const result = a ** b
      // A negative exponent always produces a float in Python.
      const asFloat =
        left instanceof Float || right instanceof Float || b < 0 || !Number.isFinite(result)
      return asFloat ? new Float(result) : Math.trunc(result)
    }

    return this.arith(left, right, line, (a, b) => a - b)
  }

  /** Validate two numeric operands and return them as plain JS numbers. */
  private numericOperands(
    left: PyValue,
    right: PyValue,
    line: number,
    op: string,
  ): [number, number] {
    const leftOk = isNumber(left)
    const rightOk = isNumber(right)
    if (!leftOk || !rightOk) {
      const bad = leftOk ? right : left
      const hint =
        typeof bad === 'string'
          ? ` — did you forget quotes around '${pyStr(bad).slice(0, 24)}'?`
          : ''
      throw new PyError(
        'TypeError',
        `unsupported operand type(s) for ${op}: '${pyTypeName(left)}' and '${pyTypeName(right)}'${hint}`,
        line,
      )
    }
    return [numVal(left), numVal(right)]
  }

  private arith(
    left: PyValue,
    right: PyValue,
    line: number,
    fn: (a: number, b: number) => number,
  ): PyValue {
    const [a, b] = this.numericOperands(left, right, line, 'this operation')
    // int + int stays int; any float operand promotes the result to float.
    const asFloat = left instanceof Float || right instanceof Float
    const result = fn(a, b)
    if (asFloat) return new Float(result)
    return Number.isInteger(result) ? result : new Float(result)
  }

  private compare(
    op: CompareOp,
    left: PyValue,
    right: PyValue,
    line: number,
  ): boolean {
    switch (op) {
      case '==':
        return valuesEqual(left, right)
      case '!=':
        return !valuesEqual(left, right)
      case 'is':
        return valuesEqual(left, right) && pyTypeName(left) === pyTypeName(right)
      case 'is not':
        return !(valuesEqual(left, right) && pyTypeName(left) === pyTypeName(right))
      case 'in':
        return this.contains(left, right, line)
      case 'not in':
        return !this.contains(left, right, line)
      default: {
        const result = compareValues(left, right, line)
        if (op === '<') return result < 0
        if (op === '>') return result > 0
        if (op === '<=') return result <= 0
        return result >= 0
      }
    }
  }

  private contains(needle: PyValue, haystack: PyValue, line: number): boolean {
    if (typeof haystack === 'string') {
      if (typeof needle !== 'string') {
        throw new PyError(
          'TypeError',
          `'in <string>' requires string as left operand, not ${pyTypeName(needle)}`,
          line,
        )
      }
      return haystack.includes(needle)
    }
    if (Array.isArray(haystack)) return haystack.some((item) => valuesEqual(item, needle))
    if (isDict(haystack)) {
      if (lookupKey(haystack, needle, line) !== undefined) return true
      return false
    }
    throw new PyError(
      'TypeError',
      `argument of type '${pyTypeName(haystack)}' is not iterable`,
      line,
    )
  }

  private index(target: PyValue, index: PyValue, line: number): PyValue {
    if (typeof target === 'string') {
      const i = this.normaliseIndex(index, Array.from(target).length, line, 'string')
      return Array.from(target)[i] ?? ''
    }
    if (Array.isArray(target)) {
      const i = this.normaliseIndex(index, target.length, line, 'list')
      const item = target[i]
      if (item === undefined) {
        throw new PyError('IndexError', 'list index out of range', line)
      }
      return item
    }
    if (isDict(target)) {
      const found = lookupKey(target, index, line)
      if (found === undefined) {
        throw new PyError('KeyError', pyRepr(index), line)
      }
      return found
    }
    throw new PyError(
      'TypeError',
      `'${pyTypeName(target)}' object is not subscriptable`,
      line,
    )
  }

  private normaliseIndex(index: PyValue, length: number, line: number, label: string): number {
    if (!isInt(index)) {
      throw new PyError(
        'TypeError',
        `${label} indices must be integers or slices, not ${pyTypeName(index)}`,
        line,
      )
    }
    const i = Math.trunc(index)
    if (i < 0) return i + length
    return i
  }

  private slice(
    target: PyValue,
    start: PyValue | null,
    stop: PyValue | null,
    step: PyValue | null,
    line: number,
  ): PyValue {
    const wantNumber = (value: PyValue | null): number | Float => {
      if (value === null || !isNumber(value)) {
        throw new PyError('TypeError', 'slice indices must be integers', line)
      }
      return value
    }
    const bounds = (length: number): [number, number, number] => {
      const rawStep = step === null ? 1 : step
      if (!isInt(rawStep)) {
        throw new PyError('TypeError', 'slice indices must be integers', line)
      }
      const stepSize = Math.trunc(rawStep)
      if (stepSize === 0) throw new PyError('ValueError', 'slice step cannot be zero', line)

      let from =
        start === null ? (stepSize > 0 ? 0 : length - 1) : Math.trunc(numVal(wantNumber(start)))
      let to = stop === null ? (stepSize > 0 ? length : -1 - length) : Math.trunc(numVal(wantNumber(stop)))

      if (from < 0) from += length
      if (to < 0) to += length
      from = stepSize > 0 ? Math.max(0, Math.min(from, length)) : Math.max(-1, Math.min(from, length - 1))
      to = stepSize > 0 ? Math.max(0, Math.min(to, length)) : Math.max(-1, Math.min(to, length - 1))
      return [from, to, stepSize]
    }

    if (typeof target === 'string') {
      const chars = Array.from(target)
      const [from, to, stepSize] = bounds(chars.length)
      const out: string[] = []
      for (let i = from; stepSize > 0 ? i < to : i > to; i += stepSize) {
        out.push(chars[i] as string)
      }
      return out.join('')
    }
    if (Array.isArray(target)) {
      const [from, to, stepSize] = bounds(target.length)
      const out: PyValue[] = []
      for (let i = from; stepSize > 0 ? i < to : i > to; i += stepSize) {
        out.push(target[i] as PyValue)
      }
      return out
    }
    throw new PyError('TypeError', `'${pyTypeName(target)}' object is not subscriptable`, line)
  }
}

export type { PyValue }
export { Env }
