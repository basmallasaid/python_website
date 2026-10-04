import { useEffect, useRef, useState } from 'react'
import { CornerDownLeft, Terminal, TriangleAlert } from 'lucide-react'
import type { OutputLine, RunStatus } from '../../lib/python'
import { Button } from '../ui/Button'

const STATUS_COPY: Record<RunStatus, { label: string; className: string }> = {
  idle: { label: 'Ready', className: 'text-ink-500' },
  running: { label: 'Running', className: 'text-python-300' },
  'awaiting-input': { label: 'Waiting for input', className: 'text-sun-300' },
  done: { label: 'Finished', className: 'text-success-500' },
  error: { label: 'Error', className: 'text-danger-500' },
}

/**
 * Terminal-style output panel. When the program calls `input()` it grows a
 * single-line field and focuses it, so the learner can answer in place.
 */
export function Console({
  lines,
  status,
  prompt,
  durationMs,
  onSubmit,
  title = 'Console',
}: {
  lines: OutputLine[]
  status: RunStatus
  prompt: string
  durationMs: number
  onSubmit: (value: string) => void
  title?: string
}) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const waiting = status === 'awaiting-input'
  const copy = STATUS_COPY[status]

  // Keep the newest output in view, and focus the prompt when it appears.
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [lines, waiting])

  useEffect(() => {
    if (waiting) inputRef.current?.focus()
  }, [waiting])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    onSubmit(draft)
    setDraft('')
  }

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-950 shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-ink-800 bg-ink-900 px-3 py-2">
        <span className="flex items-center gap-2 text-ink-300">
          <Terminal className="size-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">{title}</span>
        </span>
        <span className="flex items-center gap-2 text-[11px]">
          <span className={`font-medium ${copy.className}`}>{copy.label}</span>
          {durationMs > 0 ? (
            <span className="font-mono text-ink-600 tabular-nums">{durationMs.toFixed(1)}ms</span>
          ) : null}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="scroll-thin min-h-32 flex-1 overflow-y-auto px-3 py-2.5 font-mono text-[13px] leading-6"
        role="log"
        aria-live="polite"
        aria-label="Program output"
      >
        {lines.length === 0 ? (
          <p className="text-ink-600">
            {status === 'idle' ? 'Press Run to execute your code.' : '(no output)'}
          </p>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className={
                line.stream === 'stderr'
                  ? 'text-danger-500 whitespace-pre-wrap'
                  : 'text-ink-100 whitespace-pre-wrap'
              }
            >
              {line.stream === 'stderr' && line.text.includes('Error') ? (
                <span className="inline-flex items-start gap-1.5">
                  <TriangleAlert className="mt-1 size-3 shrink-0" aria-hidden="true" />
                  <span>{line.text}</span>
                </span>
              ) : (
                line.text || ' '
              )}
            </div>
          ))
        )}
      </div>

      {waiting ? (
        <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t border-ink-800 bg-ink-900 px-3 py-2"
        >
          <label htmlFor="console-stdin" className="shrink-0 font-mono text-xs text-sun-300">
            {prompt || '›'}
          </label>
          <input
            id="console-stdin"
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoComplete="off"
            placeholder="type your answer"
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-ink-100 placeholder:text-ink-600 focus:outline-none"
          />
          <Button type="submit" size="sm" variant="primary" icon={<CornerDownLeft className="size-3" />}>
            Send
          </Button>
        </form>
      ) : null}
    </div>
  )
}
