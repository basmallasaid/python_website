import { Lightbulb } from 'lucide-react'
import { SHARED_STRINGS } from '../strings'

export function HintButton({
  onHint,
  used,
  max,
}: {
  onHint: () => void
  used: number
  max: number
}) {
  const left = Math.max(0, max - used)
  const exhausted = left === 0

  return (
    <button
      type="button"
      onClick={onHint}
      disabled={exhausted}
      aria-label={SHARED_STRINGS.hint}
      className="inline-flex h-12 items-center gap-2 rounded-2xl border border-ink-200 bg-surface px-4 text-sm font-semibold text-ink-700 shadow-soft transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Lightbulb className="size-5 text-sun-600" aria-hidden="true" />
      {SHARED_STRINGS.hint}
      <span className="rounded-lg bg-sun-100 px-1.5 py-0.5 font-mono text-[11px] text-sun-800 tabular-nums">
        {left}/{max}
      </span>
    </button>
  )
}
