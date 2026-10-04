import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Apple, ArrowRight, Hand, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'

type Stage = 'idle' | 'carrying' | 'stored' | 'reassigned'

const STAGE_COPY: Record<Stage, { code: string; note: string }> = {
  idle: {
    code: '# The name "fruit" has not been used yet.',
    note: 'Nothing is in the box. The name fruit does not exist.',
  },
  carrying: {
    code: 'fruit = "Apple"',
    note: 'The right side is evaluated first, then the name fruit is pointed at the text.',
  },
  stored: {
    code: 'fruit = "Apple"\nprint(fruit)   # Apple',
    note: 'Using the name fetches whatever is in the box right now.',
  },
  reassigned: {
    code: 'fruit = "Apple"\nfruit = "Banana"\nprint(fruit)   # Banana',
    note: 'The name was repointed. The box labelled fruit now holds "Banana".',
  },
}

/**
 * Makes the assignment metaphor literal: the value physically travels from the
 * shelf into the box labelled with the variable name.
 */
export function VariableLab() {
  const [stage, setStage] = useState<Stage>('idle')
  const copy = STAGE_COPY[stage]
  const appleInBox = stage === 'stored' || stage === 'reassigned'
  const bananaInBox = stage === 'reassigned'

  const advance = () => {
    setStage((prev) => {
      if (prev === 'idle') return 'carrying'
      if (prev === 'carrying') return 'stored'
      if (prev === 'stored') return 'reassigned'
      return prev
    })
  }

  const advanceLabel =
    stage === 'idle'
      ? 'Run the assignment'
      : stage === 'carrying'
        ? 'Store it in the box'
        : stage === 'stored'
          ? 'Reassign the name'
          : 'Finished'

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-ink-200/70 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Variable Lab</h3>
          <p className="mt-0.5 text-xs text-ink-500">
            Watch what <code className="font-mono text-python-700">=</code> actually does.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setStage('idle')}
          icon={<RotateCcw className="size-3.5" />}
          disabled={stage === 'idle'}
        >
          Reset
        </Button>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {/* ---- Shelf: the literal value ---- */}
        <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
            <Hand className="size-3" aria-hidden="true" />
            The value
          </p>
          <div className="flex min-h-24 items-center justify-center">
            <motion.div
              animate={{
                opacity: bananaInBox ? 0.25 : 1,
                scale: stage === 'carrying' ? 0.9 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-1.5"
            >
              <motion.div
                animate={{ x: stage === 'carrying' ? 12 : 0, rotate: stage === 'carrying' ? 12 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <Apple
                  className="size-12 text-danger-500 drop-shadow-sm"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </motion.div>
              <code className="font-mono text-xs text-ink-600">"Apple"</code>
            </motion.div>
          </div>
        </div>

        <ArrowRight
          className="hidden size-5 shrink-0 text-ink-300 sm:block"
          aria-hidden="true"
        />

        {/* ---- The box labelled with the variable name ---- */}
        <div className="rounded-xl border-2 border-python-200 bg-python-50/60 p-4">
          <p className="mb-3 text-[11px] font-semibold tracking-wide text-python-600 uppercase">
            The variable name
          </p>
          <div className="mb-3 flex h-7 items-center justify-center rounded-md bg-white px-3 font-mono text-sm font-semibold text-python-700 shadow-soft">
            fruit
          </div>
          <div className="relative flex min-h-24 items-center justify-center">
            <AnimatePresence mode="wait">
              {appleInBox ? (
                <motion.div
                  key="apple"
                  initial={{ opacity: 0, scale: 0.5, y: -14 }}
                  animate={{ opacity: bananaInBox ? 0 : 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="absolute"
                >
                  <Apple
                    className="size-12 text-danger-500 drop-shadow-sm"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </motion.div>
              ) : (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-ink-400"
                >
                  {stage === 'carrying' ? 'receiving…' : 'empty'}
                </motion.span>
              )}
            </AnimatePresence>

            {bananaInBox ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <span className="font-mono text-3xl" aria-hidden="true">
                  🍌
                </span>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-200/70 bg-ink-50/60 px-5 py-4">
        <pre className="scroll-thin overflow-x-auto font-mono text-[13px] leading-6 text-ink-800">
          <code>{copy.code}</code>
        </pre>
        <p className="mt-2 min-h-10 text-xs leading-relaxed text-ink-600">{copy.note}</p>
        <Button
          variant="primary"
          size="sm"
          className="mt-3"
          onClick={advance}
          disabled={stage === 'reassigned'}
        >
          {advanceLabel}
        </Button>
      </div>
    </div>
  )
}
