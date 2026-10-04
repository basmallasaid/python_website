/**
 * Lesson 2 checker: a tiny interpreter for variables and print().
 *
 * No `eval`, no Python. Every line is scanned by hand so the error we report
 * matches what a beginner actually typed. This is the ONLY seam between the UI
 * and "running" Python — swap the body of `checkCode` for Pyodide later and
 * keep the return shape; no component has to change.
 */

import { LESSON_STRINGS } from './levels'
import { fill } from '../../strings'

export type VariableValue = string | number

export type ErrorType =
  | 'emptyCode'
  | 'missingEquals'
  | 'nameHasSpace'
  | 'nameStartsWithNumber'
  | 'invalidName'
  | 'missingName'
  | 'missingValue'
  | 'missingQuotes'
  | 'missingParen'
  | 'textOutsideQuotes'
  | 'unknownVariable'
  | 'wrongCase'
  | 'unknownStatement'
  | 'extraCharacters'
  | 'emptyPrint'

/** One thing the code did, in the order Python would do it. The UI animates these. */
export type Step = {
  /** 1-based line number in the source. */
  line: number
  type: 'create' | 'update' | 'print'
  /** The variable touched — empty for a print with no variable in it. */
  name: string
  oldValue?: VariableValue
  newValue?: VariableValue
  /** What print() said. */
  text?: string
}

export type CheckError = {
  type: ErrorType
  friendlyMessage: string
  line: number
}

export type CheckResult = {
  ok: boolean
  /** Final value of every variable, after the whole program ran. */
  variables: Record<string, VariableValue>
  /** One entry per print() call, in order. */
  outputs: string[]
  steps: Step[]
  error?: CheckError
}

const ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '\\': '\\',
  '"': '"',
  "'": "'",
  '0': '\0',
}

/** Human wording for every failure, kept with the rest of the lesson's copy. */
const ERRORS = LESSON_STRINGS.checkerErrors as Record<ErrorType, string>

type Fail = { ok: false; error: CheckError }

type LineOk = {
  ok: true
  /** Set when the line assigns to a variable. */
  assign?: { name: string; value: VariableValue }
  /** Set when the line calls print(). */
  print?: { text: string; used: string[] }
}

type LineResult = Fail | LineOk

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/
const NUMBER_RE = /^-?\d+(?:\.\d+)?$/
const IDENT_AT = /^[A-Za-z_][A-Za-z0-9_]*/
const NUMBER_AT = /^-?\d+(?:\.\d+)?/
const PRINT_OPEN_RE = /^print\s*\(/

function fail(type: ErrorType, line: number, values: Record<string, string | number> = {}): Fail {
  return { ok: false, error: { type, friendlyMessage: fill(ERRORS[type], values), line } }
}

function decode(text: string): string {
  return text.replace(/\\(.)/g, (match, char: string) => ESCAPES[char] ?? match)
}

/**
 * Drop a trailing `#` comment — but keep any `#` that lives inside quotes,
 * the same way Python does.
 */
function stripComment(source: string): string {
  let quote = ''

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]

    if (quote !== '') {
      if (char === '\\') i += 1
      else if (char === quote) quote = ''
      continue
    }

    if (char === '"' || char === "'") quote = char
    else if (char === '#') return source.slice(0, i)
  }

  return source
}

/** Walk from an opening quote to its partner. Returns where the string ended. */
function scanString(source: string, start: number, quote: string) {
  let i = start + 1
  let raw = ''
  let closed = false

  while (i < source.length) {
    const char = source[i]
    if (char === '\\' && i + 1 < source.length) {
      raw += char + source[i + 1]
      i += 2
      continue
    }
    if (char === quote) {
      closed = true
      i += 1
      break
    }
    raw += char
    i += 1
  }

  return { raw, closed, end: i }
}

/**
 * Find a variable, and explain the two classic mix-ups: a name that does not
 * exist yet, and a name that is right but spelled with different capitals.
 */
function lookup(name: string, line: number, variables: Record<string, VariableValue>) {
  if (name in variables) return { ok: true as const, value: variables[name] }

  const capitalised = Object.keys(variables).find(
    (key) => key.toLowerCase() === name.toLowerCase(),
  )
  if (capitalised) return fail('wrongCase', line, { name, correct: capitalised })

  return fail('unknownVariable', line, { name })
}

/** The right-hand side of `name = …`: a string, a number, or another box. */
function parseValue(raw: string, line: number, variables: Record<string, VariableValue>) {
  if (raw === '') return fail('missingValue', line)

  const quote = raw[0]
  if (quote === '"' || quote === "'") {
    const scanned = scanString(raw, 0, quote)
    if (!scanned.closed) return fail('missingQuotes', line)
    if (raw.slice(scanned.end).trim() !== '') return fail('extraCharacters', line)
    return { ok: true as const, value: decode(scanned.raw) }
  }

  if (NUMBER_RE.test(raw)) return { ok: true as const, value: Number(raw) }

  if (NAME_RE.test(raw)) return lookup(raw, line, variables)

  // A word followed by more words: the kid forgot the quotes.
  if (/^[A-Za-z_][A-Za-z0-9_]*(\s|$)/.test(raw)) return fail('textOutsideQuotes', line)

  if (raw.includes('"') || raw.includes("'")) return fail('missingQuotes', line)

  return fail('unknownStatement', line)
}

/** `name = value`, with a friendly error for each way the name can go wrong. */
function runAssign(source: string, line: number, variables: Record<string, VariableValue>): LineResult {
  const rawName = source.slice(0, source.indexOf('=')).trim()
  const rawValue = source.slice(source.indexOf('=') + 1).trim()

  if (rawName === '') return fail('missingName', line)

  if (/\s/.test(rawName)) {
    // Suggest the first word on its own — usually exactly what they meant.
    const suggestion = rawName.split(/\s+/)[0]
    return fail('nameHasSpace', line, { suggestion })
  }

  if (/^\d/.test(rawName)) return fail('nameStartsWithNumber', line, { name: rawName })

  if (!NAME_RE.test(rawName)) return fail('invalidName', line, { name: rawName })

  // Right name, wrong capitals — only knowable once the box exists.
  const capitalised = Object.keys(variables).find(
    (key) => key !== rawName && key.toLowerCase() === rawName.toLowerCase(),
  )
  if (capitalised) return fail('wrongCase', line, { name: rawName, correct: capitalised })

  const value = parseValue(rawValue, line, variables)
  if (!value.ok) return value

  return { ok: true, assign: { name: rawName, value: value.value } }
}

/** `print(…)` with quoted words, plain numbers and variables mixed together. */
function runPrint(source: string, line: number, variables: Record<string, VariableValue>): LineResult {
  const open = PRINT_OPEN_RE.exec(source)
  if (!open) return fail('missingParen', line)

  let i = open[0].length
  const args: string[] = []
  const used: string[] = []
  let closed = false

  const skipSpace = () => {
    while (i < source.length && /\s/.test(source[i])) i += 1
  }
  const rest = () => source.slice(i)

  skipSpace()

  if (rest()[0] === ')') {
    return fail('emptyPrint', line)
  }

  while (i < source.length) {
    const char = source[i]

    if (char === '"' || char === "'") {
      const scanned = scanString(source, i, char)
      if (!scanned.closed) return fail('missingQuotes', line)
      args.push(decode(scanned.raw))
      i = scanned.end
    } else if (IDENT_AT.test(rest())) {
      const name = IDENT_AT.exec(rest())![0]
      const found = lookup(name, line, variables)
      if (!found.ok) return found
      args.push(String(found.value))
      used.push(name)
      i += name.length
    } else if (NUMBER_AT.test(rest())) {
      const literal = NUMBER_AT.exec(rest())![0]
      args.push(literal)
      i += literal.length
    } else {
      return fail('unknownStatement', line)
    }

    skipSpace()

    if (rest()[0] === ',') {
      i += 1
      skipSpace()
      continue
    }
    if (rest()[0] === ')') {
      closed = true
      i += 1
      break
    }
    if (i >= source.length) break
    return fail('missingParen', line)
  }

  if (!closed) return fail('missingParen', line)

  skipSpace()
  if (i < source.length) return fail('extraCharacters', line)

  return { ok: true, print: { text: args.join(' '), used } }
}

/** Blank lines and `#` comments are skipped — everything else must be understood. */
function runLine(
  source: string,
  line: number,
  variables: Record<string, VariableValue>,
): LineResult | null {
  const trimmed = source.trim()
  if (trimmed === '' || trimmed.startsWith('#')) return null

  const code = stripComment(trimmed).trim()
  if (code === '') return null

  const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(code)?.[0] ?? ''

  if (word && word !== 'print' && word.toLowerCase() === 'print') {
    return fail('wrongCase', line, { name: word, correct: 'print' })
  }

  if (/^print\b/.test(code)) return runPrint(code, line, variables)

  if (code.includes('=')) {
    // `==`, `<=`, `+=` … are real Python but a long way past this lesson.
    if (/[=!<>+\-*/%]=/.test(code)) return fail('unknownStatement', line)
    return runAssign(code, line, variables)
  }

  // `hero_name "Zed"` or a bare `hero_name` — a name and a value with no `=` between them.
  if (/^[A-Za-z_][A-Za-z0-9_]*(\s+.+)?$/.test(code)) return fail('missingEquals', line)

  return fail('unknownStatement', line)
}

/**
 * Run the kid's program.
 *
 * @param _level reserved for level-specific rules (kept for the future engine)
 */
export function checkCode(code: string, _level?: unknown): CheckResult {
  const lines = code.split(/\r?\n/)
  const variables: Record<string, VariableValue> = {}
  const outputs: string[] = []
  const steps: Step[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1
    const result = runLine(lines[index], lineNumber, variables)

    if (result === null) continue
    if (!result.ok) {
      // Nothing is animated on a failure, so the stage starts from scratch.
      return { ok: false, variables: {}, outputs: [], steps: [], error: result.error }
    }

    if (result.assign) {
      const { name, value } = result.assign
      const exists = name in variables
      steps.push({
        line: lineNumber,
        type: exists ? 'update' : 'create',
        name,
        oldValue: exists ? variables[name] : undefined,
        newValue: value,
      })
      variables[name] = value
      continue
    }

    if (result.print) {
      const { text, used } = result.print
      steps.push({ line: lineNumber, type: 'print', name: used[0] ?? '', text })
      outputs.push(text)
    }
  }

  if (steps.length === 0) {
    return { ok: false, variables: {}, outputs: [], steps: [], error: fail('emptyCode', 1).error }
  }

  return { ok: true, variables, outputs, steps }
}

export { ERRORS as CHECKER_ERRORS }