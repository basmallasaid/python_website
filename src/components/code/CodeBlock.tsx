import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { HIGHLIGHT_CLASS, highlightPython, type HighlightSpan } from '../../lib/python'

function renderSpans(spans: HighlightSpan[]) {
  return spans.map((span, index) => (
    <span key={index} className={HIGHLIGHT_CLASS[span.kind]}>
      {span.text}
    </span>
  ))
}

/**
 * Read-only, syntax-highlighted Python sample. Hovering a line highlights it,
 * and the whole block can be copied in one click.
 */
export function CodeBlock({
  code,
  caption,
  className = '',
  showLineNumbers = false,
}: {
  code: string
  caption?: string
  className?: string
  showLineNumbers?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const highlighted = useMemo(() => highlightPython(code), [code])
  const lines = useMemo(() => splitHighlighted(highlighted), [highlighted])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure
      className={`overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-soft ${className}`}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-ink-800 bg-ink-950/60 px-3 py-2">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-danger-500/70" />
          <span className="size-2.5 rounded-full bg-warn-500/70" />
          <span className="size-2.5 rounded-full bg-success-500/70" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-[11px] text-ink-500">
          {caption ?? 'main.py'}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
          className="flex size-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-100"
        >
          {copied ? <Check className="size-3.5 text-success-500" /> : <Copy className="size-3.5" />}
        </button>
      </figcaption>

      <pre className="scroll-thin overflow-x-auto px-1 py-3 font-mono text-[13px] leading-6">
        <code>
          {lines.map((spans, index) => (
            <span
              key={index}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className={`block px-3 transition-colors ${
                hovered === index ? 'bg-white/5' : ''
              }`}
            >
              {showLineNumbers ? (
                <span className="mr-4 inline-block w-5 text-right text-ink-600 select-none">
                  {index + 1}
                </span>
              ) : null}
              {spans.length === 0 ? (
                <span> </span>
              ) : (
                renderSpans(spans)
              )}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

/** Split a flat span list into per-line span lists, preserving newline text. */
function splitHighlighted(spans: HighlightSpan[]): HighlightSpan[][] {
  const lines: HighlightSpan[][] = [[]]
  for (const span of spans) {
    const parts = span.text.split('\n')
    parts.forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part !== '') lines[lines.length - 1]?.push({ text: part, kind: span.kind })
    })
  }
  return lines
}
