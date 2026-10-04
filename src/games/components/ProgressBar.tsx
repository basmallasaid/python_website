import { motion } from 'framer-motion'
import { fill, SHARED_STRINGS } from '../strings'

export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label: string
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2.5 w-full overflow-hidden rounded-full bg-ink-200"
    >
      <motion.div
        className="h-full rounded-full bg-linear-to-r from-python-400 to-python-600"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="sr-only">
        {fill(SHARED_STRINGS.levelOf, { n: value, total: max })}
      </span>
    </div>
  )
}
