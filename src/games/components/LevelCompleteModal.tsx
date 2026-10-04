import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PartyPopper, X } from 'lucide-react'
import { LESSON_STRINGS } from '../lessons/01-print-robot/levels'
import { SHARED_STRINGS } from '../strings'

export type StarRowProps = {
  stars: number
  className?: string
  starClassName?: string
}

export function StarRow({ stars, className = 'flex items-center gap-1', starClassName = 'size-7' }: StarRowProps) {
  return (
    <span className={className} aria-label={SHARED_STRINGS.starsLabel.replace('{n}', String(stars))}>
      {[1, 2, 3].map((i) => (
        <Star key={i} filled={i <= stars} className={starClassName} />
      ))}
    </span>
  )
}

export function Star({ filled, className = 'size-7' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.8l2.83 5.73 6.32.92-4.57 4.46 1.08 6.29L12 17.2l-5.66 3-1.08-6.29L.85 9.45l6.32-.92L12 2.8z"
        fill={filled ? '#ffd43b' : '#e2e8f0'}
        stroke={filled ? '#e0a800' : '#cbd5e1'}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LevelCompleteModal({
  open,
  stars,
  isLessonComplete = false,
  body,
  onNext,
  onClose,
}: {
  open: boolean
  stars: number
  isLessonComplete?: boolean
  body: string
  onNext: () => void
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Keyboard friendly: Escape closes, focus moves into the dialog.
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 20 }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-[2px]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isLessonComplete ? SHARED_STRINGS.lessonComplete : SHARED_STRINGS.levelComplete}
            initial={{ scale: reduceMotion ? 1 : 0.85, y: reduceMotion ? 0 : 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: reduceMotion ? 1 : 0.9, opacity: 0 }}
            transition={spring}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-pop sm:p-7"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={SHARED_STRINGS.tryAgain}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-4" />
            </button>

            <motion.span
              initial={reduceMotion ? false : { rotate: -12, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.15, ...spring }}
              className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sun-100 text-sun-600"
            >
              <PartyPopper className="size-8" aria-hidden="true" />
            </motion.span>

            <h2 className="mt-4 text-2xl font-bold text-ink-900">
              {isLessonComplete ? SHARED_STRINGS.lessonComplete : SHARED_STRINGS.levelComplete}
            </h2>

            {isLessonComplete ? (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-700">
                {SHARED_STRINGS.lessonCompleteBadge}
              </span>
            ) : (
              <div className="mt-3 flex justify-center">
                <StarRow stars={stars} starClassName="size-9" />
              </div>
            )}

            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              {isLessonComplete
                ? body
                : stars === 3
                  ? LESSON_STRINGS.starMessages.three
                  : stars === 2
                    ? LESSON_STRINGS.starMessages.two
                    : LESSON_STRINGS.starMessages.one}
            </p>

            <button
              type="button"
              onClick={onNext}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-python-600 px-6 text-base font-semibold text-white shadow-soft transition-colors hover:bg-python-700"
            >
              {isLessonComplete ? SHARED_STRINGS.hubCta : SHARED_STRINGS.nextLevel}
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
