import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Coins } from 'lucide-react'
import type { VariableValue } from './checker'
import { fill } from '../../strings'

export type VariableBoxProps = {
  /** The name on the tag — this is the variable name. */
  name: string
  /** What is inside the box right now. */
  value: VariableValue | undefined
  /** Which line of the code last touched this box, shown as a small tag. */
  line: number
  /** Which line last touched this box — `create` pops it in, `update` flashes it. */
  entrance: 'create' | 'update'
  /** Template for the little "Line 3" tag. */
  lineTagTemplate: string
  /** Text shown while the box has no value yet. */
  emptyText: string
  /** Renders a coin icon next to numeric values (used for `coins`). */
  withCoins?: boolean
}

const spring = (reduceMotion: boolean) =>
  reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 24 }

/**
 * One variable, drawn as a box with a name tag.
 *
 * The box springs in when the variable is created, and the value slides out /
 * slides in whenever it is re-assigned — which is the whole idea of the lesson,
 * so the two states get different animations on purpose.
 */
export function VariableBox({
  name,
  value,
  line,
  entrance,
  lineTagTemplate,
  emptyText,
  withCoins = false,
}: VariableBoxProps) {
  const reduceMotion = useReducedMotion() ?? false
  const showValue = value !== undefined && value !== ''
  const numeric = typeof value === 'number'

  return (
    <motion.li
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.55, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: -8 }}
      transition={spring(reduceMotion)}
      className="flex w-28 shrink-0 flex-col items-center sm:w-32"
    >
      {/* ---- Name tag on top of the box ---- */}
      <span className="max-w-full truncate rounded-t-xl rounded-b-sm bg-ink-800 px-2.5 py-1 font-mono text-[11px] leading-tight font-bold text-sun-300">
        {name}
      </span>

      {/* ---- The box itself ---- */}
      <motion.div
        animate={
          entrance === 'update' && !reduceMotion
            ? { scale: [1, 1.07, 1] }
            : undefined
        }
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`flex w-full min-h-14 items-center justify-center rounded-2xl rounded-tl-sm border-2 bg-white px-2 py-2 shadow-card ${
          entrance === 'update' ? 'border-sun-400' : 'border-python-300'
        }`}
      >
        {withCoins && numeric ? (
          <Coins className="mr-1 size-4 shrink-0 text-sun-500" aria-hidden="true" />
        ) : null}

        <AnimateValue value={showValue ? value : undefined} emptyText={emptyText} numeric={numeric} reduceMotion={reduceMotion} />
      </motion.div>

      {/* ---- Which line made this box ---- */}
      <span className="mt-1 font-mono text-[10px] text-ink-400">
        {fill(lineTagTemplate, { n: line })}
      </span>
    </motion.li>
  )
}

/** Slides the old value out to the left and the new one in from the right. */
function AnimateValue({
  value,
  emptyText,
  numeric,
  reduceMotion,
}: {
  value: VariableValue | undefined
  emptyText: string
  numeric: boolean
  reduceMotion: boolean
}) {
  return (
    <span className="relative flex w-full justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value === undefined ? 'empty' : String(value)}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 26, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -26, scale: 0.85 }}
          transition={spring(reduceMotion)}
          className={`truncate text-center font-mono text-[15px] leading-tight font-bold ${
            value === undefined
              ? 'text-ink-300'
              : numeric
                ? 'text-python-700 tabular-nums'
                : 'text-ink-900'
          }`}
        >
          {value === undefined ? emptyText : String(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}