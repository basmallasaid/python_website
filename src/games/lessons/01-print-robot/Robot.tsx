import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type RobotState = 'idle' | 'talking' | 'happy' | 'confused'

type RobotProps = {
  state: RobotState
  /** Messages revealed so far — one bubble per print() line. */
  bubbles: string[]
  /** Shown when nothing has been said yet. */
  idleText: string
  label: string
}

const TYPE_SPEED_MS = 34

export function Robot({ state, bubbles, idleText, label }: RobotProps) {
  const reduceMotion = useReducedMotion()
  const current = bubbles.length > 0 ? bubbles[bubbles.length - 1]! : ''
  const previous = bubbles.slice(0, -1)

  const [typed, setTyped] = useState('')
  const [tracked, setTracked] = useState(current)

  // A new bubble restarts the typing effect. Adjusting state during render is
  // the React-recommended way to reset on a prop change.
  if (current !== tracked) {
    setTracked(current)
    setTyped('')
  }

  useEffect(() => {
    if (!current || reduceMotion) return

    let i = 0
    const timer = window.setInterval(() => {
      i += 1
      setTyped(current.slice(0, i))
      if (i >= current.length) window.clearInterval(timer)
    }, TYPE_SPEED_MS)
    return () => window.clearInterval(timer)
  }, [current, reduceMotion])

  const shown = reduceMotion ? current : typed
  const typing = Boolean(current) && shown.length < current.length

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* ---- Speech bubbles ---- */}
      <div className="flex min-h-28 w-full flex-col items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.div
              key={bubbles.length}
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -12 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 320, damping: 22 }
              }
              className="relative max-w-[min(100%,22rem)] rounded-2xl rounded-bl-md bg-white px-5 py-3.5 shadow-lift"
            >
              <p className="text-center text-base leading-snug font-semibold break-words text-ink-900 sm:text-lg">
                {shown}
                {typing ? (
                  <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-python-500 align-middle" />
                ) : null}
              </p>
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-7 size-3 rotate-45 bg-white"
              />
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink-500"
            >
              {idleText}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Earlier lines stay as a small trail so the order is obvious. */}
        {previous.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex max-w-full flex-wrap items-center justify-center gap-1.5"
          >
            {previous.map((message, index) => (
              <li
                key={`${index}-${message}`}
                className="max-w-[12rem] truncate rounded-full bg-white/70 px-2.5 py-1 font-mono text-[11px] text-ink-400"
              >
                {message}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </div>

      {/* ---- Robot ---- */}
      <motion.svg
        viewBox="0 0 160 170"
        className="w-36 shrink-0 sm:w-44"
        role="img"
        aria-label={label}
        animate={reduceMotion || state !== 'talking' ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Antenna */}
        <motion.g
          animate={reduceMotion ? undefined : { rotate: state === 'confused' ? [0, -14, 10, 0] : [0, 6, 0] }}
          style={{ originX: '80px', originY: '30px' }}
          transition={
            state === 'confused'
              ? { duration: 1.1, repeat: Infinity }
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <path d="M80 30 L80 14" stroke="#244c72" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="11" r="6" fill={state === 'confused' ? '#f59e0b' : '#3776ab'} />
        </motion.g>

        {/* Arms */}
        <motion.g
          animate={reduceMotion ? undefined : { rotate: state === 'talking' ? [0, 14, -6, 0] : 0 }}
          style={{ originX: '46px', originY: '104px' }}
          transition={
            state === 'talking'
              ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.4 }
          }
        >
          <rect x="24" y="96" width="14" height="34" rx="7" fill="#3776ab" />
        </motion.g>
        <motion.g
          animate={reduceMotion ? undefined : { rotate: state === 'talking' ? [0, -14, 6, 0] : 0 }}
          style={{ originX: '114px', originY: '104px' }}
          transition={
            state === 'talking'
              ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.4 }
          }
        >
          <rect x="122" y="96" width="14" height="34" rx="7" fill="#3776ab" />
        </motion.g>

        {/* Body */}
        <rect x="46" y="94" width="68" height="44" rx="16" fill="#3776ab" />
        <rect x="58" y="106" width="44" height="20" rx="8" fill="#f2f7fc" />
        <circle cx="68" cy="116" r="3.5" fill="#22c55e" />
        <circle cx="80" cy="116" r="3.5" fill="#ffd43b" />
        <circle cx="92" cy="116" r="3.5" fill="#ef4444" />

        {/* Legs */}
        <rect x="56" y="134" width="14" height="26" rx="7" fill="#244c72" />
        <rect x="90" y="134" width="14" height="26" rx="7" fill="#244c72" />

        {/* Head */}
        <rect x="38" y="30" width="84" height="62" rx="22" fill="#559fd9" stroke="#3776ab" strokeWidth="3" />

        {/* Eyes */}
        <motion.g
          animate={reduceMotion ? undefined : { y: state === 'confused' ? [0, 3, 0] : [0, -2, 0] }}
          transition={{ duration: state === 'confused' ? 0.9 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {state === 'confused' ? (
            <>
              <path d="M62 52 L74 58" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M86 52 L98 58" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M62 58 L74 52" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M86 58 L98 52" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="66" cy="55" r="8" fill="#ffffff" />
              <circle cx="94" cy="55" r="8" fill="#ffffff" />
              <motion.circle
                cx="66"
                cy="55"
                r="4"
                fill="#0f172a"
                animate={reduceMotion ? undefined : { x: [0, 2, 0], y: [0, 2, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="94"
                cy="55"
                r="4"
                fill="#0f172a"
                animate={reduceMotion ? undefined : { x: [0, -2, 0], y: [0, 2, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}
        </motion.g>

        {/* Mouth */}
        {state === 'happy' ? (
          <motion.path
            d="M58 68 Q 80 86 102 68"
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
          />
        ) : state === 'confused' ? (
          <motion.path
            d="M66 76 Q 80 66 94 76"
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={reduceMotion ? undefined : { d: ['M66 76 Q 80 66 94 76', 'M66 76 Q 80 86 94 76'] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <motion.ellipse
            cx="80"
            cy="72"
            rx="9"
            fill="#0f172a"
            animate={
              reduceMotion
                ? undefined
                : { ry: typing ? [5, 11, 5] : state === 'talking' ? [4, 9, 4] : [5, 6, 5] }
            }
            transition={{ duration: typing ? 0.22 : 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Cheeks when happy */}
        {state === 'happy' ? (
          <>
            <circle cx="50" cy="70" r="5" fill="#f9a8a8" opacity="0.85" />
            <circle cx="110" cy="70" r="5" fill="#f9a8a8" opacity="0.85" />
          </>
        ) : null}
      </motion.svg>
    </div>
  )
}
