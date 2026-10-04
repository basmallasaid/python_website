import { toErrorInfo, type PyErrorInfo } from './errors'
import { Interpreter, type InterpreterOptions } from './interpreter'
import type { PyValue } from './values'

export type RunStatus = 'idle' | 'running' | 'awaiting-input' | 'done' | 'error'

export interface OutputLine {
  id: number
  text: string
  stream: 'stdout' | 'stderr'
}

export interface RunResult {
  status: RunStatus
  lines: OutputLine[]
  /** Prompt waiting for the user's next line of input. */
  prompt: string
  error: PyErrorInfo | null
  /** Every variable the program bound, in binding order. */
  variables: { name: string; value: PyValue }[]
  durationMs: number
}

let lineId = 0

/**
 * Imperative wrapper around the interpreter so React components can drive a
 * program with plain state updates instead of async plumbing.
 */
export class PythonSession {
  private interpreter: Interpreter | null = null
  private partial = ''
  private bindings = new Map<string, PyValue>()
  private startedAt = 0

  state: RunResult = {
    status: 'idle',
    lines: [],
    prompt: '',
    error: null,
    variables: [],
    durationMs: 0,
  }

  /** Compile and start (or restart) a program. */
  run(source: string, options?: InterpreterOptions): void {
    this.reset()
    this.startedAt = performance.now()
    this.state.status = 'running'

    const bindings = this.bindings
    try {
      this.interpreter = new Interpreter(source, {
        ...options,
        onBind: (name, value) => {
          bindings.delete(name)
          bindings.set(name, value)
        },
      })
    } catch (err) {
      // Compile-time failure (syntax / indentation) — shown as a traceback line.
      const info = toErrorInfo(err)
      this.state.status = 'error'
      this.state.error = info
      this.state.durationMs = performance.now() - this.startedAt
      this.pushLine('Traceback (most recent call last):', 'stderr')
      if (info.line !== null) this.pushLine(`  File "main.py", line ${info.line}`, 'stderr')
      this.pushLine(`${info.kind}: ${info.message}`, 'stderr')
      return
    }

    this.pump()
  }

  /** Advance to the next input() call or the end of the program. */
  private pump(): void {
    if (!this.interpreter) return
    const events = this.interpreter.runUntilBlocked()

    for (const event of events) {
      if (event.type === 'output') {
        if (event.stream === 'stderr') {
          this.flushPartial()
          this.pushLine(event.text, 'stderr')
          this.state.error = event.error ?? this.state.error
          continue
        }
        this.appendText(event.text)
        continue
      }
      this.flushPartial()
      this.state.prompt = event.prompt
      this.state.status = 'awaiting-input'
    }

    if (this.state.status !== 'awaiting-input') {
      this.flushPartial()
      this.state.prompt = ''
      this.state.status = this.state.error ? 'error' : 'done'
      this.state.durationMs = performance.now() - this.startedAt
    }

    this.state.variables = [...this.bindings].map(([name, value]) => ({ name, value }))
  }

  /** Submit a line of input to the pending input() call. */
  submit(value: string): void {
    if (this.state.status !== 'awaiting-input') return
    this.state.prompt = ''
    this.state.status = 'running'
    this.pushLine(`› ${value}`, 'stdout')
    this.interpreter?.provideInput(value)
    this.pump()
  }

  stop(): void {
    this.interpreter?.cancel()
    this.interpreter = null
    this.state.status = this.state.lines.length > 0 ? 'done' : 'idle'
    this.state.prompt = ''
  }

  reset(): void {
    this.interpreter?.cancel()
    this.interpreter = null
    this.partial = ''
    this.bindings = new Map()
    this.state = {
      status: 'idle',
      lines: [],
      prompt: '',
      error: null,
      variables: [],
      durationMs: 0,
    }
  }

  private appendText(text: string): void {
    const parts = (this.partial + text).split('\n')
    this.partial = parts.pop() ?? ''
    for (const part of parts) this.pushLine(part, 'stdout')
  }

  private flushPartial(): void {
    if (this.partial !== '') {
      this.pushLine(this.partial, 'stdout')
      this.partial = ''
    }
  }

  private pushLine(text: string, stream: 'stdout' | 'stderr'): void {
    this.state.lines = [...this.state.lines, { id: ++lineId, text, stream }]
  }
}
