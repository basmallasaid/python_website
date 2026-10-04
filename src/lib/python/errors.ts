/** Runtime + compile-time error types for the Python subset. */

export type PyErrorKind =
  | 'SyntaxError'
  | 'IndentationError'
  | 'TabError'
  | 'NameError'
  | 'TypeError'
  | 'ValueError'
  | 'IndexError'
  | 'KeyError'
  | 'ZeroDivisionError'
  | 'AttributeError'
  | 'RuntimeError'
  | 'NotImplementedError'

export interface PyErrorInfo {
  kind: PyErrorKind
  message: string
  line: number | null
}

/** An error that Python would raise, carrying the 1-based source line. */
export class PyError extends Error {
  readonly kind: PyErrorKind
  readonly line: number | null

  constructor(kind: PyErrorKind, message: string, line: number | null = null) {
    super(message)
    this.name = 'PyError'
    this.kind = kind
    this.line = line
  }

  toInfo(): PyErrorInfo {
    return { kind: this.kind, message: this.message, line: this.line }
  }
}

export const pyError = (
  kind: PyErrorKind,
  line: number | null,
  template: string,
  ...args: unknown[]
): PyError => new PyError(kind, args.length > 0 ? formatMessage(template, args) : template, line)

const formatMessage = (template: string, args: unknown[]): string => {
  let i = 0
  return template.replace(/\{[^}]*\}/g, (match) => {
    if (match === '{}') return String(args[i++])
    return match
  })
}

export function toErrorInfo(err: unknown): PyErrorInfo {
  if (err instanceof PyError) return err.toInfo()
  if (err instanceof RangeError) {
    // Recursion / runaway nesting in the interpreter itself.
    return {
      kind: 'RuntimeError',
      message: 'Maximum call depth exceeded. Try simplifying your expression.',
      line: null,
    }
  }
  const message = err instanceof Error ? err.message : String(err)
  return { kind: 'RuntimeError', message, line: null }
}
