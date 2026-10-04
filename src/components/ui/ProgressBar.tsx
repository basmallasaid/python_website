export function ProgressBar({
  value,
  label,
  size = 'md',
  tone = 'brand',
  showValue = false,
  className = '',
}: {
  /** 0–1 */
  value: number
  label: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'brand' | 'success' | 'warn'
  showValue?: boolean
  className?: string
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }
  const fills = {
    brand: 'bg-python-500',
    success: 'bg-success-500',
    warn: 'bg-warn-500',
  }

  return (
    <div className={className}>
      {showValue || label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium text-ink-600">{label}</span>
          {showValue ? (
            <span className="font-mono text-xs tabular-nums text-ink-500">{pct}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={`w-full overflow-hidden rounded-full bg-ink-100 ${heights[size]}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-soft)] ${fills[tone]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
