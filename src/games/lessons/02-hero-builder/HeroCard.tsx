import { motion, useReducedMotion } from 'framer-motion'
import { Coins, Palette } from 'lucide-react'

export type HeroStrings = {
  /** Describes the whole card for screen readers. */
  cardLabel: string
  defaultName: string
  powerLabel: string
  coinsLabel: string
  colorLabel: string
  powerStrong: string
  powerWeak: string
  powerMax: string
  /** Placeholder for the power read-out before `power` exists. */
  powerUnknown: string
}

export type HeroCardProps = {
  /** `hero_name` — falls back to a mystery name until it exists. */
  name?: string
  /** `power` — drives the bar and the glow. */
  power?: number
  /** `coins` — shown with a coin icon. */
  coins?: number
  /** `color` — one of the supported suit colors. */
  color?: string
  /** True once the level is solved. */
  happy?: boolean
  strings: HeroStrings
}

/** Suit palette per supported color name, plus a neutral fallback. */
const SUITS: Record<string, { main: string; dark: string; light: string }> = {
  red: { main: '#ef4444', dark: '#b91c1c', light: '#fca5a5' },
  blue: { main: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd' },
  gold: { main: '#f0bc0a', dark: '#a17207', light: '#ffe88a' },
  purple: { main: '#8b5cf6', dark: '#6d28d9', light: '#c4b5fd' },
  green: { main: '#22c55e', dark: '#15803d', light: '#86efac' },
  grey: { main: '#94a3b8', dark: '#64748b', light: '#e2e8f0' },
}

const MAX_POWER = 100

const suitFor = (color?: string) => SUITS[(color ?? 'grey').toLowerCase()] ?? SUITS.grey

const clampPower = (power: number) => Math.min(MAX_POWER, Math.max(0, power))

/**
 * The hero, drawn with plain SVG shapes and driven by the variables.
 *
 * `color` picks the outfit, `power` fills the bar and the glow, `coins` gets a
 * coin badge, `name` goes on the nameplate. Every value is optional so the card
 * renders happily before any code has run.
 */
export function HeroCard({ name, power, coins, color, happy = false, strings }: HeroCardProps) {
  const reduceMotion = useReducedMotion() ?? false

  const suit = suitFor(color)
  const suitName = (color ?? 'grey').toLowerCase()
  const level = power === undefined ? 0 : clampPower(power)
  const ratio = level / MAX_POWER
  const glowing = ratio >= 0.5

  const displayName = name && name.trim() !== '' ? name : strings.defaultName
  const mood = happy ? strings.powerMax : ratio >= 0.75 ? strings.powerStrong : strings.powerWeak

  return (
    <div className="relative flex w-full flex-col items-center gap-3">
      {/* ---- Glow: brighter and bigger the stronger the hero is ---- */}
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : { scale: 0.85 + ratio * 0.35, opacity: 0.25 + ratio * 0.55 }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute top-6 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: suit.main }}
      />

      {/* ---- Nameplate + coin badge ---- */}
      <div className="relative z-10 flex w-full max-w-56 items-center justify-center gap-2">
        <span className="truncate rounded-2xl bg-white px-3 py-1 text-sm font-bold text-ink-900 shadow-soft">
          {displayName}
        </span>
        {coins !== undefined ? (
          <span
            aria-label={`${strings.coinsLabel}: ${coins}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sun-100 px-2 py-1 font-mono text-xs font-bold text-sun-800 tabular-nums"
          >
            <Coins className="size-3.5 text-sun-500" aria-hidden="true" />
            {coins}
          </span>
        ) : null}
      </div>

      {/* ---- Suit color chip ---- */}
      <span
        className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-ink-500"
      >
        <Palette className="size-3" aria-hidden="true" />
        {strings.colorLabel}: {suitName}
      </span>

      {/* ---- The hero ---- */}
      <motion.svg
        viewBox="0 0 180 200"
        role="img"
        aria-label={`${strings.cardLabel}: ${displayName}`}
        animate={reduceMotion || !glowing ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-36 shrink-0 sm:w-44"
      >
        {/* Cape */}
        <path d="M60 74 L34 176 Q90 190 146 176 L120 74 Z" fill={suit.dark} />

        {/* Legs + boots */}
        <rect x="70" y="140" width="16" height="30" rx="8" fill="#334155" />
        <rect x="94" y="140" width="16" height="30" rx="8" fill="#334155" />
        <rect x="62" y="164" width="28" height="14" rx="7" fill={suit.dark} />
        <rect x="90" y="164" width="28" height="14" rx="7" fill={suit.dark} />

        {/* Body */}
        <rect x="58" y="88" width="64" height="58" rx="20" fill={suit.main} />
        {/* Belt */}
        <rect x="58" y="128" width="64" height="12" fill={suit.dark} />
        <circle cx="90" cy="134" r="5" fill="#ffd43b" />

        {/* Arms */}
        <rect x="38" y="92" width="16" height="46" rx="8" fill={suit.main} />
        <rect x="126" y="92" width="16" height="46" rx="8" fill={suit.main} />
        <rect x="38" y="132" width="16" height="14" rx="7" fill={suit.light} />
        <rect x="126" y="132" width="16" height="14" rx="7" fill={suit.light} />

        {/* Head + helmet */}
        <rect x="62" y="28" width="56" height="52" rx="20" fill="#ffe8d6" />
        <path d="M62 54 Q90 18 118 54 L118 46 Q90 14 62 46 Z" fill={suit.main} />
        <rect x="62" y="28" width="56" height="52" rx="20" fill="none" stroke={suit.dark} strokeWidth="3" />

        {/* Mask / eyes */}
        <rect x="68" y="48" width="44" height="20" rx="10" fill={suit.dark} />
        {happy ? (
          <>
            <path d="M72 60 Q78 54 84 60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M96 60 Q102 54 108 60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="78" cy="58" r="4" fill="#ffffff" />
            <circle cx="102" cy="58" r="4" fill="#ffffff" />
          </>
        )}

        {/* Mouth */}
        {happy ? (
          <path d="M78 70 Q90 82 102 70" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <rect x="82" y="70" width="16" height="4" rx="2" fill="#0f172a" />
        )}

        {/* Chest emblem — a lightning bolt once the hero is powered up */}
        {glowing ? (
          <motion.path
            d="M92 96 L80 116 L89 116 L86 132 L100 110 L91 110 Z"
            fill="#ffd43b"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 18 }}
            style={{ transformOrigin: '91px 114px' }}
          />
        ) : null}
      </motion.svg>

      {/* ---- Power bar ---- */}
      <div className="relative z-10 w-full max-w-56">
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-ink-500">
          <span>{strings.powerLabel}</span>
          <span className="font-mono tabular-nums">
            {power === undefined ? strings.powerUnknown : `${level}/${MAX_POWER}`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={level}
          aria-valuemin={0}
          aria-valuemax={MAX_POWER}
          aria-label={strings.powerLabel}
          className="h-3 w-full overflow-hidden rounded-full bg-ink-200"
        >
          <motion.div
            initial={false}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{
              backgroundImage: `linear-gradient(90deg, ${suit.light}, ${suit.main})`,
            }}
          />
        </div>
        <p className="mt-1.5 text-center text-xs font-bold text-ink-500">{mood}</p>
      </div>
    </div>
  )
}