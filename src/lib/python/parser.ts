import { PyError } from './errors'
import { AUGMENTED_ASSIGNMENTS, tokenize, type Token } from './tokenizer'
import type {
  AssignTarget,
  BinOpExpr,
  CompareOp,
  Expr,
  FStringContentPart,
  Program,
  Stmt,
} from './ast'
import { Float, type PyValue } from './values'

class Parser {
  private readonly tokens: Token[]
  private index = 0
  /** Byte offset of each logical line, for re-parsing f-string expressions. */
  private readonly source: string

  constructor(source: string, tokens?: Token[]) {
    this.source = source
    this.tokens = tokens ?? tokenize(source)
  }

  /* ----------------------------- token helpers ---------------------------- */

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.index + offset, this.tokens.length - 1)] ?? {
      type: 'EOF',
      value: '',
      line: 0,
    }
  }

  private get current(): Token {
    return this.peek(0)
  }

  private next(): Token {
    const token = this.peek(0)
    if (this.index < this.tokens.length - 1) this.index += 1
    return token
  }

  private at(type: Token['type'], value?: string): boolean {
    const token = this.current
    return token.type === type && (value === undefined || token.value === value)
  }

  private atKeyword(value: string): boolean {
    return this.at('KEYWORD', value)
  }

  private atOp(value: string): boolean {
    return this.at('OP', value)
  }

  private eat(type: Token['type'], value?: string): boolean {
    if (this.at(type, value)) {
      this.next()
      return true
    }
    return false
  }

  private expect(type: Token['type'], value?: string): Token {
    if (!this.at(type, value)) {
      throw new PyError(
        'SyntaxError',
        this.describeExpected(type, value),
        this.current.line,
      )
    }
    return this.next()
  }

  private describeExpected(type: Token['type'], value?: string): string {
    const got = this.current
    if (got.type === 'EOF') return 'unexpected end of input (expected ' + label(type, value) + ')'
    if (got.type === 'NEWLINE') return `unexpected end of line (expected ${label(type, value)})`
    return `invalid syntax: expected ${label(type, value)} but found ${JSON.stringify(got.value)}`
  }

  private skipNewlines(): void {
    while (this.at('NEWLINE')) this.next()
  }

  /* -------------------------------- program ------------------------------- */

  parseProgram(): Program {
    this.skipNewlines()
    const body = this.parseStatements()
    this.skipNewlines()
    if (!this.at('EOF')) {
      throw new PyError(
        'SyntaxError',
        `invalid syntax: unexpected ${JSON.stringify(this.current.value)}`,
        this.current.line,
      )
    }
    void this.source
    return { kind: 'Program', body }
  }

  /** Parses statements until DEDENT or EOF. */
  private parseStatements(): Stmt[] {
    const statements: Stmt[] = []
    for (;;) {
      while (this.at('NEWLINE')) this.next()
      if (this.at('EOF') || this.at('DEDENT')) break

      if (this.atCompoundStart()) {
        // Compound statements end at their block's DEDENT and carry no
        // trailing NEWLINE, matching CPython's token stream.
        statements.push(this.parseCompoundStatement())
        continue
      }

      for (;;) {
        statements.push(this.parseSimpleStatement())
        if (!this.eat('OP', ';')) break
        if (this.at('NEWLINE') || this.at('EOF') || this.at('DEDENT')) break
      }

      if (this.at('NEWLINE')) {
        this.next()
      } else if (!this.at('EOF') && !this.at('DEDENT')) {
        throw new PyError(
          'SyntaxError',
          `invalid syntax: unexpected ${JSON.stringify(this.current.value)}`,
          this.current.line,
        )
      }
    }
    return statements
  }

  private atCompoundStart(): boolean {
    return (
      this.atKeyword('if') ||
      this.atKeyword('while') ||
      this.atKeyword('for') ||
      this.atKeyword('def') ||
      this.atKeyword('class') ||
      this.atKeyword('try') ||
      this.atKeyword('with')
    )
  }

  private parseCompoundStatement(): Stmt {
    const token = this.current
    switch (token.value) {
      case 'if':
        return this.parseIf()
      case 'while':
        return this.parseWhile()
      case 'for':
        return this.parseFor()
      default:
        return this.parseStatement()
    }
  }

  /** Parses a block: either an indented suite or inline `;`-separated statements. */
  private parseBlock(): Stmt[] {
    if (this.at('NEWLINE')) {
      while (this.at('NEWLINE')) this.next()
      if (!this.at('INDENT')) {
        throw new PyError('IndentationError', 'expected an indented block', this.current.line)
      }
      this.next()
      const body = this.parseStatements()
      if (!this.at('DEDENT')) {
        throw new PyError('IndentationError', 'expected an indented block', this.current.line)
      }
      this.next()
      return body
    }

    // Inline suite: `if x: print(1); print(2)`
    const inline: Stmt[] = []
    for (;;) {
      if (this.atCompoundStart()) {
        inline.push(this.parseCompoundStatement())
        break
      }
      inline.push(this.parseSimpleStatement())
      if (!this.eat('OP', ';')) break
      if (this.at('NEWLINE') || this.at('EOF') || this.at('DEDENT')) break
    }
    if (this.at('NEWLINE')) this.next()
    return inline
  }

  /* ------------------------------- statements ------------------------------ */

  private parseStatement(): Stmt {
    const token = this.current

    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'if':
          return this.parseIf()
        case 'while':
          return this.parseWhile()
        case 'for':
          return this.parseFor()
        case 'def':
          return this.unsupported('def', 'Function definitions arrive in Module 3.')
        case 'class':
          return this.unsupported('class', 'Classes arrive in Module 4.')
        case 'import':
          return this.unsupported('import', 'Imports arrive in Module 3.')
        case 'from':
          return this.unsupported('from ... import', 'Imports arrive in Module 3.')
        case 'lambda':
          return this.unsupported('lambda', 'Functions arrive in Module 3.')
        case 'try':
          return this.unsupported('try / except', 'Error handling arrives in Module 3.')
        case 'with':
          return this.unsupported('with', 'File handling arrives in Module 4.')
        default:
          break
      }
    }

    return this.parseSimpleStatement()
  }

  /** Simple (non-compound) statement: expression, assignment, or jump. */
  private parseSimpleStatement(): Stmt {
    const token = this.current

    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'break':
          this.next()
          return { kind: 'BreakStmt', line: token.line }
        case 'continue':
          this.next()
          return { kind: 'ContinueStmt', line: token.line }
        case 'pass':
          this.next()
          return { kind: 'PassStmt', line: token.line }
        case 'return':
          this.next()
          return {
            kind: 'UnsupportedStmt',
            label: 'return',
            hint: 'return only works inside a function \u2014 functions arrive in Module 3.',
            line: token.line,
          }
        case 'del': {
          const line = this.next().line
          this.parseExpressionList()
          return {
            kind: 'UnsupportedStmt',
            label: 'del',
            hint: 'Try setting the name to 0 or an empty string instead.' ,
            line,
          }
        }
        case 'elif':
          throw new PyError(
            'SyntaxError',
            "invalid syntax: 'elif' without a matching 'if'",
            token.line,
          )
        case 'else':
          throw new PyError(
            'SyntaxError',
            "invalid syntax: 'else' without a matching 'if'",
            token.line,
          )
        default:
          break
      }
    }

    // Expression / assignment statement
    const expr = this.parseExpressionList()

    if (this.at('OP', '=')) {
      const line = this.current.line
      // `a = b = value` chains targets.
      const targets: AssignTarget[] = [this.toAssignTarget(expr)]
      while (this.eat('OP', '=')) {
        const value = this.parseExpressionList()
        if (this.at('OP', '=')) {
          targets.push(this.toAssignTarget(value))
          continue
        }
        return { kind: 'AssignStmt', targets, value, line }
      }
      throw new PyError('SyntaxError', 'invalid syntax: expected a value after "="', line)
    }

    if (this.current.type === 'OP' && AUGMENTED_ASSIGNMENTS.has(this.current.value)) {
      const op = this.next().value as BinOpExpr['op']
      const value = this.parseExpressionList()
      return {
        kind: 'AugAssignStmt',
        target: this.toAssignTarget(expr),
        op: op.slice(0, -1) as BinOpExpr['op'],
        value,
        line: expr.line,
      }
    }

    return { kind: 'ExprStmt', expr, line: expr.line }
  }

  /**
   * Records a statement we recognise but cannot run, then skips everything
   * it owns (including its indented block) so the rest still parses.
   */
  private unsupported(label: string, hint: string): Stmt {
    const line = this.current.line
    while (!this.at('NEWLINE') && !this.at('EOF') && !this.at('DEDENT')) this.next()
    this.skipNestedBlock()
    return { kind: 'UnsupportedStmt', label, hint, line }
  }

  /** Consume an indented block without interpreting it. */
  private skipNestedBlock(): void {
    if (!this.at('NEWLINE')) return
    while (this.at('NEWLINE')) this.next()
    if (!this.at('INDENT')) return
    let depth = 0
    do {
      if (this.at('INDENT')) depth += 1
      else if (this.at('DEDENT')) depth -= 1
      this.next()
    } while (depth > 0 && !this.at('EOF'))
  }

  private toAssignTarget(expr: Expr): AssignTarget {
    if (expr.kind === 'NameExpr') return { kind: 'name', name: expr.name }
    if (expr.kind === 'IndexExpr') {
      return { kind: 'item', target: expr.target, index: expr.index }
    }
    if (expr.kind === 'TupleLit' || expr.kind === 'ListLit') {
      const names: string[] = []
      for (const element of expr.elements) {
        if (element.kind !== 'NameExpr') {
          throw new PyError(
            'SyntaxError',
            'cannot unpack a non-variable target',
            element.line,
          )
        }
        names.push(element.name)
      }
      return { kind: 'unpack', names }
    }
    if (expr.kind === 'AttrExpr') {
      throw new PyError(
        'NotImplementedError',
        `cannot set the attribute '${expr.attr}' yet — objects arrive in Module 4.`,
        expr.line,
      )
    }
    throw new PyError('SyntaxError', 'cannot assign to this expression', expr.line)
  }

  private parseIf(): Stmt {
    const line = this.next().line // consume `if`
    const test = this.parseExpression()
    this.expect('OP', ':')
    const body = this.parseBlock()
    const orelse = this.parseElseChain()
    return { kind: 'IfStmt', test, body, orelse, line }
  }

  /** Shared tail for `if` / `elif` chains. */
  private parseElseChain(): Stmt[] {
    this.skipNewlines()
    if (this.atKeyword('elif')) return [this.parseElif()]
    if (this.atKeyword('else')) {
      this.next()
      this.expect('OP', ':')
      return this.parseBlock()
    }
    return []
  }

  private parseElif(): Stmt {
    const line = this.next().line
    const test = this.parseExpression()
    this.expect('OP', ':')
    const body = this.parseBlock()
    const orelse = this.parseElseChain()
    return { kind: 'IfStmt', test, body, orelse, line }
  }

  private parseWhile(): Stmt {
    const line = this.next().line
    const test = this.parseExpression()
    this.expect('OP', ':')
    const body = this.parseBlock()
    return { kind: 'WhileStmt', test, body, line }
  }

  private parseFor(): Stmt {
    const line = this.next().line
    const targetExpr = this.parseTargetList()
    if (!this.atKeyword('in')) {
      throw new PyError('SyntaxError', "invalid syntax: expected 'in'", this.current.line)
    }
    this.next()
    const iter = this.parseExpressionList()
    this.expect('OP', ':')
    const body = this.parseBlock()
    return { kind: 'ForStmt', target: targetExpr, iter, body, line }
  }

  /** `x` or `a, b` in a `for` header. */
  private parseTargetList(): string[] {
    const first = this.expect('NAME')
    const names = [first.value]
    while (this.eat('OP', ',')) {
      if (this.atKeyword('in')) break
      names.push(this.expect('NAME').value)
    }
    return names
  }

  /* ------------------------------- expressions ----------------------------- */

  /** Handles comma-separated tuples: `a, b, c`. */
  private parseExpressionList(): Expr {
    const first = this.parseExpression()
    if (!this.atOp(',')) return first

    const elements = [first]
    while (this.eat('OP', ',')) {
      if (this.at('NEWLINE') || this.at('EOF') || this.atOp('=') || this.atOp(')')) break
      elements.push(this.parseExpression())
    }
    return { kind: 'TupleLit', elements, line: first.line }
  }

  parseExpression(): Expr {
    if (this.atKeyword('lambda')) {
      const line = this.next().line
      while (!this.atOp(':') && !this.at('NEWLINE') && !this.at('EOF')) this.next()
      this.expect('OP', ':')
      this.parseExpression()
      throw new PyError(
        'NotImplementedError',
        'lambda expressions are not supported yet — Module 3.',
        line,
      )
    }
    return this.parseTernary()
  }

  private parseTernary(): Expr {
    const body = this.parseOr()
    if (this.atKeyword('if')) {
      const line = this.next().line
      const test = this.parseOr()
      this.expect('KEYWORD', 'else')
      const orelse = this.parseExpression()
      return { kind: 'TernaryExpr', body, test, orelse, line }
    }
    return body
  }

  private parseOr(): Expr {
    let left = this.parseAnd()
    while (this.atKeyword('or')) {
      const line = this.next().line
      const right = this.parseAnd()
      left = { kind: 'BoolExpr', op: 'or', left, right, line }
    }
    return left
  }

  private parseAnd(): Expr {
    let left = this.parseNot()
    while (this.atKeyword('and')) {
      const line = this.next().line
      const right = this.parseNot()
      left = { kind: 'BoolExpr', op: 'and', left, right, line }
    }
    return left
  }

  private parseNot(): Expr {
    if (this.atKeyword('not')) {
      const line = this.next().line
      return { kind: 'NotExpr', operand: this.parseNot(), line }
    }
    return this.parseComparison()
  }

  private parseComparison(): Expr {
    const left = this.parseAdditive()
    const comparators: { op: CompareOp; expr: Expr }[] = []

    for (;;) {
      let op: CompareOp | null = null
      if (
        this.at('OP', '==') ||
        this.at('OP', '!=') ||
        this.at('OP', '<') ||
        this.at('OP', '>') ||
        this.at('OP', '<=') ||
        this.at('OP', '>=')
      ) {
        op = this.next().value as CompareOp
      } else if (this.atKeyword('in')) {
        this.next()
        op = 'in'
      } else if (
        this.atKeyword('not') &&
        this.peek(1).type === 'KEYWORD' &&
        this.peek(1).value === 'in'
      ) {
        this.next()
        this.next()
        op = 'not in'
      } else if (this.atKeyword('is')) {
        this.next()
        if (this.atKeyword('not')) {
          this.next()
          op = 'is not'
        } else {
          op = 'is'
        }
      } else {
        break
      }
      comparators.push({ op, expr: this.parseAdditive() })
    }

    if (comparators.length === 0) return left
    return { kind: 'CompareExpr', left, comparators, line: left.line }
  }


  private parseAdditive(): Expr {
    let left = this.parseMultiplicative()
    while (this.atOp('+') || this.atOp('-')) {
      const op = this.next().value as '+' | '-'
      const right = this.parseMultiplicative()
      left = { kind: 'BinOpExpr', op, left, right, line: left.line }
    }
    return left
  }

  private parseMultiplicative(): Expr {
    let left = this.parseUnary()
    while (
      this.atOp('*') ||
      this.atOp('/') ||
      this.atOp('//') ||
      this.atOp('%') ||
      this.atOp('@')
    ) {
      const op = this.next().value as BinOpExpr['op']
      const right = this.parseUnary()
      left = { kind: 'BinOpExpr', op, left, right, line: left.line }
    }
    return left
  }

  private parseUnary(): Expr {
    if (this.atOp('-') || this.atOp('+') || this.atOp('~')) {
      const line = this.current.line
      const op = this.next().value as '-' | '+' | '~'
      return { kind: 'UnaryExpr', op, operand: this.parseUnary(), line }
    }
    return this.parsePower()
  }

  private parsePower(): Expr {
    const base = this.parsePostfix()
    if (this.atOp('**')) {
      const line = this.next().line
      const exponent = this.parseUnary() // right-associative
      return { kind: 'BinOpExpr', op: '**', left: base, right: exponent, line }
    }
    return base
  }

  private parsePostfix(): Expr {
    let expr = this.parseAtom()
    for (;;) {
      if (this.atOp('(')) {
        expr = this.parseCall(expr)
        continue
      }
      if (this.atOp('[')) {
        expr = this.parseSubscript(expr)
        continue
      }
      if (this.atOp('.')) {
        const line = this.next().line
        const attr = this.current
        if (attr.type !== 'NAME' && attr.type !== 'KEYWORD') {
          throw new PyError(
            'SyntaxError',
            "invalid syntax: expected an attribute name after '.'",
            line,
          )
        }
        this.next()
        expr = { kind: 'AttrExpr', target: expr, attr: attr.value, line }
        continue
      }
      break
    }
    return expr
  }

  private parseCall(callee: Expr): Expr {
    const line = this.next().line // consume `(`
    const args: Expr[] = []
    const keywords: { name: string; value: Expr }[] = []

    while (!this.atOp(')')) {
      if (this.at('NEWLINE')) this.next()
      if (this.atOp(')')) break

      if (this.at('NAME') && this.peek(1).type === 'OP' && this.peek(1).value === '=') {
        const name = this.next().value
        this.next()
        keywords.push({ name, value: this.parseExpression() })
      } else if (this.atOp('**')) {
        this.next()
        const value = this.parseExpression()
        if (value.kind !== 'DictLit') {
          throw new PyError('TypeError', 'argument after ** must be a dict', line)
        }
        for (const entry of value.entries) {
          if (entry.key.kind !== 'StringLit') {
            throw new PyError('TypeError', 'keywords must be strings', line)
          }
          keywords.push({ name: entry.key.value, value: entry.value })
        }
      } else if (this.atOp('*')) {
        this.next()
        const value = this.parseExpression()
        if (value.kind !== 'ListLit' && value.kind !== 'TupleLit') {
          throw new PyError('TypeError', 'argument after * must be a sequence', line)
        }
        args.push(...value.elements)
      } else {
        const value = this.parseExpression()
        if (this.atKeyword('for')) {
          args.push(this.parseComprehension(value))
        } else {
          args.push(value)
        }
      }

      if (!this.eat('OP', ',')) break
    }

    this.expect('OP', ')')
    return { kind: 'CallExpr', callee, args, keywords, line }
  }

  /** `expr for x in y [if cond]` in tail position. */
  private parseComprehension(element: Expr): Expr {
    const line = this.next().line // consume `for`
    const target = this.expect('NAME').value
    this.expect('KEYWORD', 'in')
    const iter = this.parseOr()
    let test: Expr | null = null
    if (this.atKeyword('if')) {
      this.next()
      test = this.parseOr()
    }
    if (!this.at('OP', ']') && !this.atOp(',') && !this.atOp(')')) {
      throw new PyError(
        'NotImplementedError',
        'Nested `for` clauses in comprehensions are not supported yet.',
        line,
      )
    }
    return { kind: 'Comprehension', element, target, iter, test, line }
  }

  private parseSubscript(target: Expr): Expr {
    const line = this.next().line // consume `[`
    const start = this.atOp(':') ? null : this.parseExpressionList()
    if (this.atOp(':')) {
      this.next()
      const stop = this.atOp(']') || this.atOp(':') ? null : this.parseExpression()
      let step: Expr | null = null
      if (this.eat('OP', ':')) step = this.atOp(']') ? null : this.parseExpression()
      this.expect('OP', ']')
      return { kind: 'SliceExpr', target, start, stop, step, line }
    }
    this.expect('OP', ']')
    if (!start) throw new PyError('SyntaxError', 'invalid subscript', line)
    return { kind: 'IndexExpr', target, index: start, line }
  }

  private parseAtom(): Expr {
    const token = this.current

    if (token.type === 'NUMBER') {
      this.next()
      const raw = Number(token.value)
      if (Number.isNaN(raw)) {
        throw new PyError('SyntaxError', `invalid number literal ${token.value}`, token.line)
      }
      // A literal with a `.` or exponent is a Python `float`, even when integral.
      const isFloatLiteral = /[.eE]/.test(token.value)
      const value: PyValue = isFloatLiteral ? new Float(raw) : raw
      return { kind: 'NumberLit', value, line: token.line }
    }


    if (token.type === 'STRING') {
      this.next()
      let value = token.text ?? ''
      // Adjacent string literals concatenate: "a" "b" -> "ab"
      while (this.at('STRING')) value += this.next().text ?? ''
      return { kind: 'StringLit', value, line: token.line }
    }

    if (token.type === 'FSTRING') {
      this.next()
      const parts: FStringContentPart[] = (token.parts ?? []).map((part) =>
        part.type === 'literal'
          ? { type: 'literal', value: part.value }
          : {
              type: 'expr',
              expr: parseExpressionSource(part.code, part.line),
              conversion: part.conversion,
              spec: part.spec,
              line: part.line,
            },
      )
      return { kind: 'FStringLit', parts, line: token.line }
    }

    if (token.type === 'KEYWORD') {
      if (token.value === 'True' || token.value === 'False') {
        this.next()
        return { kind: 'BoolLit', value: token.value === 'True', line: token.line }
      }
      if (token.value === 'None') {
        this.next()
        return { kind: 'NoneLit', line: token.line }
      }
      if (token.value === 'not' || token.value === 'lambda') return this.parseNot()
    }

    if (token.type === 'NAME') {
      this.next()
      return { kind: 'NameExpr', name: token.value, line: token.line }
    }

    if (token.type === 'OP') {
      if (token.value === '(') return this.parseParenAtom(token.line)
      if (token.value === '[') return this.parseBracketAtom(token.line)
      if (token.value === '{') return this.parseBraceAtom(token.line)
    }

    throw new PyError(
      'SyntaxError',
      this.current.type === 'EOF'
        ? 'unexpected end of input \u2014 a value was expected here'
        : `invalid syntax: unexpected ${JSON.stringify(this.current.value)}`,
      token.line,
    )
  }

  private parseParenAtom(line: number): Expr {
    this.next() // consume `(`
    if (this.atOp(')')) {
      this.next()
      return { kind: 'TupleLit', elements: [], line }
    }
    const first = this.parseExpression()
    if (this.atOp(',')) {
      const elements = [first]
      while (this.eat('OP', ',')) {
        if (this.atOp(')')) break
        elements.push(this.parseExpression())
      }
      this.expect('OP', ')')
      return { kind: 'TupleLit', elements, line }
    }
    this.expect('OP', ')')
    return first
  }

  private parseBracketAtom(line: number): Expr {
    this.next() // consume `[`
    if (this.atOp(']')) {
      this.next()
      return { kind: 'ListLit', elements: [], line }
    }
    const first = this.parseExpression()
    if (this.atKeyword('for')) {
      const comprehension = this.parseComprehension(first)
      this.expect('OP', ']')
      return comprehension
    }
    const elements = [first]
    while (this.eat('OP', ',')) {
      if (this.atOp(']')) break
      elements.push(this.parseExpression())
    }
    this.expect('OP', ']')
    return { kind: 'ListLit', elements, line }
  }

  private parseBraceAtom(line: number): Expr {
    this.next() // consume `{`
    if (this.atOp('}')) {
      this.next()
      return { kind: 'DictLit', entries: [], line }
    }
    const first = this.parseExpression()
    if (this.atOp(':')) {
      this.next()
      const entries = [{ key: first, value: this.parseExpression() }]
      while (this.eat('OP', ',')) {
        if (this.atOp('}')) break
        const key = this.parseExpression()
        this.expect('OP', ':')
        entries.push({ key, value: this.parseExpression() })
      }
      this.expect('OP', '}')
      return { kind: 'DictLit', entries, line }
    }
    const elements = [first]
    while (this.eat('OP', ',')) {
      if (this.atOp('}')) break
      elements.push(this.parseExpression())
    }
    this.expect('OP', '}')
    return { kind: 'SetLit', elements, line }
  }
}

const label = (type: Token['type'], value?: string): string => {
  if (value) return `'${value}'`
  const names: Partial<Record<Token['type'], string>> = {
    NAME: 'a variable name',
    STRING: 'a string',
    NUMBER: 'a number',
    OP: 'an operator',
    KEYWORD: 'a keyword',
    INDENT: 'an indented block',
    DEDENT: 'the end of a block',
    NEWLINE: 'the end of a line',
    EOF: 'the end of the program',
  }
  return names[type] ?? type.toLowerCase()
}

/** Parse a standalone expression (used for f-string interpolation). */
export function parseExpressionSource(code: string, line: number): Expr {
  const parser = new Parser(code, tokenize(code, { flat: true }))
  const expr = parser.parseExpression()
  return retagLines(expr, line)
}

/** Rewrite line numbers so errors inside an f-string point at the real line. */
function retagLines<T extends { line: number }>(node: T, line: number): T {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit)
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (typeof record['line'] === 'number') record['line'] = line
      for (const key of Object.keys(record)) record[key] = visit(record[key])
    }
    return value
  }
  return visit(node) as T
}

export function parse(source: string): Program {
  return new Parser(source).parseProgram()
}
