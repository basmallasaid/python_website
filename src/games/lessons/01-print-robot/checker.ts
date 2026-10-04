export type ErrorType =
  | 'emptyCode'
  | 'wrongCase'
  | 'unknownStatement'
  | 'missingParen'
  | 'missingQuotes'
  | 'textOutsideQuotes'
  | 'extraCharacters'

export type CheckResult = {
  ok: boolean
  /** One entry per print() call, in the order Python would run them. */
  outputs: string[]
  error?: { type: ErrorType; friendlyMessage: string }
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

const fail = (type: ErrorType): CheckResult => ({
  ok: false,
  outputs: [],
  error: { type, friendlyMessage: ERRORS[type] },
})

/** Human wording for every failure the lesson-1 checker can produce. */
const ERRORS: Record<ErrorType, string> = {
  emptyCode: 'Your code looks empty. Type print("Hi!") and press Run.',
  wrongCase: 'Python cares about capital letters. Write print, not Print.',
  unknownStatement: 'The robot only knows print() so far. Wrap your words in print("…").',
  missingParen: 'You forgot the closing bracket )',
  missingQuotes: 'You forgot the closing quote " 🙂',
  textOutsideQuotes: 'Words need to live inside quotes. Try print("your words here").',
  extraCharacters: 'There is something after the closing bracket. Remove the extra bits.',
}

function decode(text: string): string {
  return text.replace(/\\(.)/g, (match, char: string) => ESCAPES[char] ?? match)
}

/**
 * Parse one line and return the text it would print.
 *
 * A tiny hand-written scanner instead of a regex soup, so the errors it reports
 * line up with what a beginner actually got wrong.
 */
function checkLine(line: string): { text: string } | CheckResult {
  // Wrong case: Print(...), PRINT(...), pRint(...)
  const keyword = /^[a-zA-Z]+/.exec(line)?.[0] ?? ''
  if (keyword && keyword !== 'print' && keyword.toLowerCase() === 'print') {
    return fail('wrongCase')
  }

  if (!/^print\s*\(/.test(line)) {
    if (/^print\b/.test(line)) return fail('missingParen')
    return fail('unknownStatement')
  }

  const open = /^print\s*\(/.exec(line)
  if (!open) return fail('missingParen')

  let i = open[0].length

  const skipSpace = () => {
    while (i < line.length && /\s/.test(line[i]!)) i += 1
  }

  skipSpace()

  const quote = line[i]
  if (quote !== '"' && quote !== "'") {
    // print(hello) — words without quotes.
    return fail('textOutsideQuotes')
  }

  let raw = ''
  let closed = false
  i += 1
  while (i < line.length) {
    const char = line[i]!
    if (char === '\\' && i + 1 < line.length) {
      raw += char + line[i + 1]
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

  if (!closed) return fail('missingQuotes')

  skipSpace()
  if (i >= line.length) return fail('missingParen')
  if (line[i] !== ')') {
    // Something like print("hi" + name) — too advanced for lesson 1.
    return fail('extraCharacters')
  }
  i += 1

  skipSpace()
  if (i < line.length) return fail('extraCharacters')

  return { text: decode(raw) }
}

function isCheckResult(value: { text: string } | CheckResult): value is CheckResult {
  return (value as CheckResult).ok !== undefined
}

/**
 * The single seam between the UI and "running" Python.
 *
 * Lesson 1 fakes it with a parser. When real Python arrives (Pyodide or a
 * server), swap the body of this function — the signature and the return value
 * stay the same, so no component has to change.
 *
 * @param _level reserved for level-specific rules (kept for the future engine)
 */
export function checkCode(code: string, _level?: unknown): CheckResult {
  const lines = code.split(/\r?\n/)
  const outputs: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) continue

    const result = checkLine(line)
    if (isCheckResult(result)) return result
    outputs.push(result.text)
  }

  if (outputs.length === 0) return fail('emptyCode')
  return { ok: true, outputs }
}

export { ERRORS as CHECKER_ERRORS }
