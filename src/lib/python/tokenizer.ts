import { PyError } from './errors'

export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'FSTRING'
  | 'NAME'
  | 'KEYWORD'
  | 'OP'
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF'

export interface FStringExprPart {
  type: 'expr'
  code: string
  conversion: 'r' | 's' | 'a' | null
  spec: string | null
  line: number
}

export type FStringPart = { type: 'literal'; value: string } | FStringExprPart

export interface Token {
  type: TokenType
  /** Raw source text of the token. */
  value: string
  /** Decoded content — only for STRING / FSTRING. */
  text?: string
  /** Interpolation chunks — only for FSTRING. */
  parts?: FStringPart[]
  line: number
}

export const KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
])

const STATEMENT_KEYWORDS = new Set([
  'if',
  'elif',
  'else',
  'for',
  'while',
  'def',
  'class',
  'try',
  'except',
  'finally',
  'with',
])

/** Longest-first so `**=` beats `**` beats `*`. */
const OPERATORS = [
  '**=',
  '//=',
  '>>=',
  '<<=',
  '...',
  '==',
  '!=',
  '<=',
  '>=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '**',
  '//',
  '->',
  ':=',
  '<<',
  '>>',
  '@=',
  '&=',
  '|=',
  '^=',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  ',',
  ':',
  '.',
  ';',
  '@',
  '=',
  '<',
  '>',
  '+',
  '-',
  '*',
  '/',
  '%',
  '&',
  '|',
  '^',
  '~',
]

const AUGMENTED_ASSIGNMENTS = new Set([
  '+=',
  '-=',
  '*=',
  '/=',
  '//=',
  '%=',
  '**=',
  '&=',
  '|=',
  '^=',
  '<<=',
  '>>=',
])

const isDigit = (c: string) => c >= '0' && c <= '9'
const isIdentStart = (c: string) =>
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c.charCodeAt(0) > 127
const isIdentPart = (c: string) => isIdentStart(c) || isDigit(c)

const SIMPLE_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  b: '\b',
  f: '\f',
  v: '\v',
  a: '\x07',
  '\\': '\\',
  "'": "'",
  '"': '"',
  '\n': '',
}

export interface TokenizeOptions {
  /** Skip INDENT/DEDENT emission — used when tokenising a bare expression. */
  flat?: boolean
}

export function tokenize(source: string, options: TokenizeOptions = {}): Token[] {
  const src = source
  const len = src.length
  const tokens: Token[] = []
  const indents: number[] = [0]

  let pos = 0
  let line = 1
  let atLineStart = true
  let depth = 0

  const push = (type: TokenType, value: string, extra?: Partial<Token>) => {
    tokens.push({ type, value, line, ...extra })
  }

  const newline = () => {
    if (atLineStart || depth > 0) return
    push('NEWLINE', '\n')
    atLineStart = true
  }

  while (pos < len) {
    const ch = src[pos] ?? ''

    // ---- Line start: measure indentation -------------------------------
    if (atLineStart && depth === 0) {
      let width = 0
      let sawTab = false
      let cursor = pos
      while (cursor < len) {
        const c = src[cursor] ?? ''
        if (c === ' ') {
          width += 1
          cursor += 1
        } else if (c === '\t') {
          width += 8 - (width % 8)
          sawTab = true
          cursor += 1
        } else if (c === '\f') {
          cursor += 1
        } else break
      }
      pos = cursor
      const next = src[pos] ?? ''
      if (next === '\r' || next === '\n') {
        // Blank line: no indent bookkeeping, no NEWLINE token. The newline must
        // still be consumed, otherwise we spin here forever.
        if (next === '\r' && src[pos + 1] === '\n') pos += 2
        else pos += 1
        line += 1
        continue
      }
      if (next === '') continue
      if (next === '#') {
        // Comment-only line. Leave `atLineStart` so the main loop consumes the
        // comment and the following newline can terminate the logical line.
        atLineStart = false
        continue
      }
      if (!options.flat) {
        const current = indents[indents.length - 1] ?? 0
        if (width > current) {
          if (sawTab) {
            throw new PyError(
              'TabError',
              'inconsistent use of tabs and spaces in indentation',
              line,
            )
          }
          indents.push(width)
          push('INDENT', '')
        } else if (width < current) {
          while ((indents[indents.length - 1] ?? 0) > width) {
            indents.pop()
            push('DEDENT', '')
          }
          if ((indents[indents.length - 1] ?? 0) !== width) {
            throw new PyError(
              'IndentationError',
              'unindent does not match any outer indentation level',
              line,
            )
          }
        }
      }
      atLineStart = false
      continue
    }

    // ---- Whitespace ----------------------------------------------------
    if (ch === ' ' || ch === '\t' || ch === '\f') {
      pos += 1
      continue
    }

    // ---- Newlines & line continuation ----------------------------------
    if (ch === '\r') {
      pos += 1
      if (src[pos] === '\n') pos += 1
      line += 1
      newline()
      continue
    }
    if (ch === '\n') {
      if (src[pos + 1] === '\\') {
        pos += 2
        continue
      }
      pos += 1
      line += 1
      newline()
      continue
    }
    if (ch === '\\' && (src[pos + 1] === '\n' || src[pos + 1] === '\r')) {
      pos += src[pos + 1] === '\r' && src[pos + 2] === '\n' ? 3 : 2
      line += 1
      continue
    }

    // ---- Comment -------------------------------------------------------
    if (ch === '#') {
      while (pos < len && src[pos] !== '\n' && src[pos] !== '\r') pos += 1
      continue
    }

    // ---- Strings -------------------------------------------------------
    if (ch === '"' || ch === "'" || ((ch === 'f' || ch === 'F') && isQuote(src[pos + 1]))) {
      const scanned = readString(src, pos, line)
      pos = scanned.end
      line += scanned.newlines
      push(scanned.type, scanned.value, {
        text: scanned.text,
        parts: scanned.parts,
      })
      continue
    }

    // ---- Numbers -------------------------------------------------------
    if (isDigit(ch) || (ch === '.' && isDigit(src[pos + 1] ?? ''))) {
      const num = readNumber(src, pos, line)
      pos = num.end
      push('NUMBER', num.value)
      continue
    }

    // ---- Names & keywords ----------------------------------------------
    if (isIdentStart(ch)) {
      let end = pos
      while (end < len && isIdentPart(src[end] ?? '')) end += 1
      const value = src.slice(pos, end)
      pos = end
      push(KEYWORDS.has(value) ? 'KEYWORD' : 'NAME', value)
      continue
    }

    // ---- Operators -----------------------------------------------------
    const op = OPERATORS.find((candidate) => src.startsWith(candidate, pos))
    if (op) {
      pos += op.length
      if (op === '(' || op === '[' || op === '{') depth += 1
      if (op === ')' || op === ']' || op === '}') depth = Math.max(0, depth - 1)
      push('OP', op)
      continue
    }

    throw new PyError('SyntaxError', `invalid character ${JSON.stringify(ch)}`, line)
  }

  if (!atLineStart && depth === 0) push('NEWLINE', '\n')

  if (!options.flat) {
    while (indents.length > 1) {
      indents.pop()
      push('DEDENT', '')
    }
  }

  tokens.push({ type: 'EOF', value: '', line })
  return tokens
}

const isQuote = (c: string | undefined) => c === '"' || c === "'"

interface ScannedString extends Token {
  end: number
  /** How many newlines the literal spanned. */
  newlines: number
}

function readString(src: string, pos: number, line: number): ScannedString {
  const prefixChar = src[pos] ?? ''
  const isF = prefixChar === 'f' || prefixChar === 'F'
  const quoteChar = isF ? (src[pos + 1] ?? '') : prefixChar
  const rawLength = isF
    ? src.startsWith(quoteChar.repeat(3), pos + 1)
      ? 4
      : 2
    : src.startsWith(quoteChar.repeat(3), pos)
      ? 3
      : 1
  const isTriple = rawLength === 3 || rawLength === 4
  const bodyStart = pos + rawLength
  const terminator = isTriple ? quoteChar.repeat(3) : quoteChar
  const quoteWidth = terminator.length

  let i = bodyStart
  while (i < src.length) {
    const c = src[i] ?? ''
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === quoteChar && src.startsWith(terminator, i)) {
      const body = src.slice(bodyStart, i)
      const newlines = countLines(src, bodyStart, i)
      const value = src.slice(pos, i + quoteWidth)
      return isF
        ? {
            type: 'FSTRING',
            value,
            text: body,
            parts: splitFString(body, line),
            line,
            end: i + quoteWidth,
            newlines,
          }
        : {
            type: 'STRING',
            value,
            text: decodeEscapes(body, line),
            line,
            end: i + quoteWidth,
            newlines,
          }
    }
    // An unescaped newline inside a single-quoted string is an error in Python.
    if (!isTriple && (c === '\n' || c === '\r')) break
    i += 1
  }

  throw new PyError(
    'SyntaxError',
    isTriple ? 'unterminated triple-quoted string literal' : 'unterminated string literal',
    line,
  )
}

const countLines = (src: string, from: number, to: number) => {
  let n = 0
  for (let i = from; i < to && i < src.length; i++) {
    if (src[i] === '\n') n += 1
  }
  return n
}

function decodeEscapes(body: string, line: number): string {
  let out = ''
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (ch !== '\\') {
      out += ch
      continue
    }
    const next = body[++i]
    if (next === undefined) break
    if (next === '\n') continue
    if (next === 'x') {
      const hex = body.slice(i + 1, i + 3)
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        out += String.fromCharCode(parseInt(hex, 16))
        i += 2
        continue
      }
      throw new PyError('SyntaxError', 'invalid \\x escape sequence', line)
    }
    if (next === 'u' || next === 'U') {
      const width = next === 'u' ? 4 : 8
      const hex = body.slice(i + 1, i + 1 + width)
      if (new RegExp(`^[0-9a-fA-F]{${width}}$`).test(hex)) {
        out += String.fromCodePoint(parseInt(hex, 16))
        i += width
        continue
      }
      throw new PyError('SyntaxError', `invalid \\${next} escape sequence`, line)
    }
    if (next === 'N' && body[i + 1] === '{') {
      const close = body.indexOf('}', i + 2)
      if (close === -1) throw new PyError('SyntaxError', 'malformed \\N character escape', line)
      out += '?'
      i = close
      continue
    }
    const simple = SIMPLE_ESCAPES[next]
    out += simple !== undefined ? simple : '\\' + next
  }
  return out
}

function readNumber(src: string, pos: number, line: number): { value: string; end: number } {
  let i = pos
  let seenDot = false
  let seenExp = false
  while (i < src.length) {
    const c = src[i] ?? ''
    if (isDigit(c) || c === '_') {
      i += 1
      continue
    }
    if (c === '.' && !seenDot && !seenExp) {
      seenDot = true
      i += 1
      continue
    }
    if ((c === 'e' || c === 'E') && !seenExp) {
      const rest = src.slice(i + 1)
      if (/^[+-]?\d/.test(rest)) {
        seenExp = true
        i += 1
        continue
      }
    }
    break
  }
  if (/[jJ]$/.test(src.slice(pos, i))) {
    throw new PyError('SyntaxError', 'complex numbers are not supported', line)
  }
  return { value: src.slice(pos, i).replace(/_/g, ''), end: i }
}

/**
 * Split an f-string body into literal text and `{expression}` chunks,
 * tracking brace nesting and nested quotes inside each expression.
 */
export function splitFString(body: string, line: number): FStringPart[] {
  const parts: FStringPart[] = []
  let literal = ''
  let i = 0

  const flush = () => {
    if (literal) {
      parts.push({ type: 'literal', value: literal })
      literal = ''
    }
  }

  while (i < body.length) {
    const ch = body[i] ?? ''

    if (ch === '{' && body[i + 1] === '{') {
      literal += '{'
      i += 2
      continue
    }
    if (ch === '}' && body[i + 1] === '}') {
      literal += '}'
      i += 2
      continue
    }
    if (ch === '}') {
      throw new PyError('SyntaxError', "f-string: single '}' is not allowed", line)
    }
    if (ch !== '{') {
      literal += ch
      i += 1
      continue
    }

    const close = matchBrace(body, i + 1)
    if (close === -1) {
      throw new PyError('SyntaxError', "f-string: expecting '}'", line)
    }
    const inner = body.slice(i + 1, close)
    const exprLine = line + countLines(body, 0, i + 1)
    i = close + 1

    const { expr, conversion, spec } = splitFormatChunk(inner, exprLine)
    if (!expr.trim()) {
      throw new PyError(
        'SyntaxError',
        'f-string: valid expression required before "{"',
        exprLine,
      )
    }
    flush()
    parts.push({ type: 'expr', code: expr, conversion, spec, line: exprLine })
  }

  flush()
  return parts
}

/** Index of the `}` closing the group that starts at `from` (already past the `{`). */
function matchBrace(body: string, from: number): number {
  let depth = 1
  let quote: string | null = null
  for (let j = from; j < body.length; j++) {
    const c = body[j] ?? ''
    if (quote) {
      if (c === '\\') {
        j += 1
        continue
      }
      if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      continue
    }
    if (c === '{' || c === '(' || c === '[') {
      depth += 1
      continue
    }
    if (c === '}' || c === ')' || c === ']') {
      depth -= 1
      if (depth === 0 && c === '}') return j
      if (depth < 0) return -1
    }
  }
  return -1
}

function splitFormatChunk(
  inner: string,
  line: number,
): { expr: string; conversion: 'r' | 's' | 'a' | null; spec: string | null } {
  let depth = 0
  let quote: string | null = null

  for (let i = 0; i < inner.length; i++) {
    const c = inner[i] ?? ''
    if (quote) {
      if (c === '\\') {
        i += 1
        continue
      }
      if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") {
      quote = c
      continue
    }
    if (c === '(' || c === '[' || c === '{') {
      depth += 1
      continue
    }
    if (c === ')' || c === ']') {
      depth -= 1
      continue
    }
    if (depth !== 0) continue

    if (c === '!' && /^[rsa]$/.test(inner[i + 1] ?? '')) {
      return { expr: inner.slice(0, i), conversion: inner[i + 1] as 'r' | 's' | 'a', spec: null }
    }
    if (c === '!' && /[!:]/.test(inner[i + 1] ?? '')) {
      throw new PyError('SyntaxError', "f-string: expecting ':' after '!'", line)
    }
    if (c === ':' && !/(?<=[!])[:]/.test(inner.slice(0, i + 1))) {
      return { expr: inner.slice(0, i), conversion: null, spec: inner.slice(i + 1) }
    }
  }
  return { expr: inner, conversion: null, spec: null }
}

export { AUGMENTED_ASSIGNMENTS, STATEMENT_KEYWORDS }
