import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { HIGHLIGHT_CLASS, highlightPython } from '../../lib/python'

const INDENT = '    '

/**
 * A textarea with a syntax-highlighted layer painted underneath it. The real
 * input stays transparent, so native caret, selection, undo and IME all keep
 * working while the code is coloured.
 */
export function PythonEditor({
  value,
  onChange,
  ariaLabel = 'Python code editor',
  minRows = 6,
  disabled = false,
}: {
  value: string
  onChange: (next: string) => void
  ariaLabel?: string
  minRows?: number
  disabled?: boolean
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const spans = useMemo(() => highlightPython(value), [value])
  const lineCount = useMemo(() => value.split('\n').length, [value])

  // Keep the line-number gutter aligned with the textarea's scroll position.
  const syncScroll = useCallback(() => {
    const area = areaRef.current
    const gutter = gutterRef.current
    if (!area || !gutter) return
    gutter.scrollTop = area.scrollTop
  }, [])

  useLayoutEffect(syncScroll, [value, syncScroll])

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab') return
    // Tab indents instead of leaving the field — expected inside a code editor.
    event.preventDefault()
    const area = event.currentTarget
    const { selectionStart, selectionEnd } = area
    const next = `${value.slice(0, selectionStart)}${INDENT}${value.slice(selectionEnd)}`
    onChange(next)
    requestAnimationFrame(() => {
      area.selectionStart = area.selectionEnd = selectionStart + INDENT.length
    })
  }

  return (
    <div className="flex overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-soft focus-within:border-python-400">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="scroll-thin shrink-0 overflow-hidden border-r border-ink-800 bg-ink-950/50 py-3 text-right font-mono text-[13px] leading-6 text-ink-600 select-none"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index} className="pr-3 pl-2 tabular-nums">
            {index + 1}
          </div>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        <pre
          aria-hidden="true"
          className="scroll-thin pointer-events-none absolute inset-0 overflow-hidden px-3 py-3 font-mono text-[13px] leading-6 whitespace-pre-wrap break-words"
        >
          <code>
            {spans.map((span, index) => (
              <span key={index} className={HIGHLIGHT_CLASS[span.kind]}>
                {span.text}
              </span>
            ))}
            {/* Trailing newline keeps the last line's height stable. */}
            {'\n'}
          </code>
        </pre>

        <textarea
          ref={areaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          rows={minRows}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={ariaLabel}
          className="editor-surface scroll-thin relative block w-full resize-y bg-transparent px-3 py-3 font-mono text-[13px] leading-6 whitespace-pre-wrap break-words text-transparent caret-sun-400 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  )
}
