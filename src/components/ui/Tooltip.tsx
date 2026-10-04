import { useId, useState, type ReactNode } from 'react'

/**
 * CSS-only tooltip. Shows on hover *and* keyboard focus so the information is
 * never mouse-gated, and dismisses on Escape.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  const position =
    side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : 'top-full left-1/2 -translate-x-1/2 mt-2'

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute z-50 w-max max-w-56 rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs leading-snug text-white shadow-pop ${position}`}
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}
