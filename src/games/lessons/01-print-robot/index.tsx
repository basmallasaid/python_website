import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { CodeEditor } from '../../components/CodeEditor'
import { RunButton } from '../../components/RunButton'
import { HintButton } from '../../components/HintButton'
import { ProgressBar } from '../../components/ProgressBar'
import { FriendlyError } from '../../components/FriendlyError'
import { ConfettiHelper } from '../../components/ConfettiHelper'
import { LevelCompleteModal, StarRow } from '../../components/LevelCompleteModal'
import { Robot, type RobotState } from './Robot'
import { LESSON_ID, LESSON_STRINGS, LEVELS, type Level } from './levels'
import { checkCode } from './checker'
import { useProgress } from '../../hooks/useProgress'
import { useSounds } from '../../hooks/useSounds'
import { fill, SHARED_STRINGS } from '../../strings'

const BUBBLE_GAP_MS = 850
const NAME_KEY = 'kidName'

const clampIndex = (index: number) => Math.min(Math.max(index, 0), LEVELS.length - 1)

const levelFromParams = (raw: string | null) => {
  const requested = Number(raw)
  return Number.isFinite(requested) && requested > 0 ? clampIndex(requested - 1) : 0
}

/**
 * Lesson 1 — "Make the Robot Talk".
 *
 * The level lives in the URL (?level=3) so it can be shared and survives a
 * reload. Everything that belongs to one attempt (code, hints, bubbles) lives
 * inside <PlayStage>, which is remounted per level via `key`.
 */
export default function PrintRobotGame() {
  const [searchParams, setSearchParams] = useSearchParams()

  const levelIndex = levelFromParams(searchParams.get('level'))
  const level = LEVELS[levelIndex]!
  const isLastLevel = levelIndex === LEVELS.length - 1

  const { setValue, getValue } = useProgress()
  const { muted, toggleMute } = useSounds()

  // The saved name arrives from localStorage after mount, so keep a local
  // override and fall back to the stored value until the kid types one.
  const [nameOverride, setNameOverride] = useState<string | null>(null)
  const kidName = nameOverride ?? getValue(LESSON_ID, NAME_KEY)
  const [pendingName, setPendingName] = useState('')

  const goToLevel = useCallback(
    (index: number) => {
      setSearchParams({ level: String(LEVELS[clampIndex(index)]!.id) }, { replace: true })
    },
    [setSearchParams],
  )

  const saveName = useCallback(() => {
    const name = pendingName.trim()
    if (!name) return
    setNameOverride(name)
    setValue(LESSON_ID, NAME_KEY, name)
    setPendingName('')
  }, [pendingName, setValue])

  return (
    <div className="flex flex-col gap-5">
      {/* ---------- Level header ---------- */}
      <section className="rounded-3xl border border-ink-200/80 bg-surface p-4 shadow-card sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
              {fill(SHARED_STRINGS.levelOf, { n: level.id, total: LEVELS.length })}
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-ink-900 sm:text-xl">{level.title}</h2>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? SHARED_STRINGS.soundOn : SHARED_STRINGS.soundOff}
            aria-pressed={!muted}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-surface text-ink-500 shadow-soft transition-colors hover:bg-ink-50 hover:text-ink-800"
          >
            {muted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
          </button>
        </div>

        <p className="mt-3 text-[15px] leading-relaxed font-medium text-ink-800 sm:text-base">
          {level.mission}
        </p>

        <div className="mt-4 flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <ProgressBar value={level.id} max={LEVELS.length} label={SHARED_STRINGS.levelProgress} />
          </div>
          <button
            type="button"
            onClick={() => goToLevel(levelIndex - 1)}
            disabled={levelIndex === 0}
            aria-label={SHARED_STRINGS.previousLevel}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-surface text-ink-500 shadow-soft transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="size-4.5" />
          </button>
          <button
            type="button"
            onClick={() => goToLevel(levelIndex + 1)}
            disabled={isLastLevel}
            aria-label={SHARED_STRINGS.nextLevelNav}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-surface text-ink-500 shadow-soft transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="size-4.5" />
          </button>
        </div>

        <LevelDots current={levelIndex} onPick={goToLevel} />
      </section>

      {/* ---------- Name gate (level 3) ---------- */}
      <AnimatePresence initial={false}>
        {level.id === LESSON_STRINGS.askNameLevelId && !kidName ? (
          <motion.section
            key="name-gate"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-3xl border border-python-200 bg-python-50/80 p-4 sm:p-5">
              <p className="text-sm font-semibold text-python-800">
                {LESSON_STRINGS.namePrompt.question}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="kid-name" className="sr-only">
                  {LESSON_STRINGS.namePrompt.label}
                </label>
                <input
                  id="kid-name"
                  value={pendingName}
                  onChange={(event) => setPendingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') saveName()
                  }}
                  placeholder={LESSON_STRINGS.namePrompt.placeholder}
                  autoComplete="off"
                  className="h-12 flex-1 rounded-2xl border border-python-200 bg-surface px-4 text-base text-ink-900 placeholder:text-ink-400"
                />
                <button
                  type="button"
                  onClick={saveName}
                  className="h-12 rounded-2xl bg-python-600 px-6 text-base font-semibold text-white shadow-soft transition-colors hover:bg-python-700"
                >
                  {SHARED_STRINGS.continue}
                </button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <PlayStage
        key={level.id}
        level={level}
        isLastLevel={isLastLevel}
        kidName={kidName}
        onNext={() => goToLevel(levelIndex + 1)}
      />
    </div>
  )
}

function LevelDots({
  current,
  onPick,
}: {
  current: number
  onPick: (index: number) => void
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {LEVELS.map((level, index) => {
        const active = index === current
        const passed = index < current
        return (
          <button
            key={level.id}
            type="button"
            onClick={() => onPick(index)}
            aria-label={fill(SHARED_STRINGS.goToLevel, { n: level.id, title: level.title })}
            aria-current={active ? 'step' : undefined}
            className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-bold transition-colors ${
              active
                ? 'bg-python-600 text-white shadow-soft'
                : passed
                  ? 'bg-success-100 text-success-700 hover:bg-success-200'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {level.id}
          </button>
        )
      })}
    </div>
  )
}

/**
 * One attempt at one level: editor, stage, hints, stars.
 *
 * Remounted whenever the level changes, which is why there is no
 * "reset when levelIndex changes" effect anywhere.
 */
function PlayStage({
  level,
  isLastLevel,
  kidName,
  onNext,
}: {
  level: Level
  isLastLevel: boolean
  kidName: string
  onNext: () => void
}) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { completeLevel } = useProgress()
  const { playSuccess, playError } = useSounds()

  const [code, setCode] = useState(level.starterCode)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [error, setError] = useState('')
  const [bubbles, setBubbles] = useState<string[]>([])
  const [robotState, setRobotState] = useState<RobotState>('idle')
  const [stars, setStars] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [copied, setCopied] = useState(false)

  const isFreePlay = level.id === LESSON_STRINGS.freePlayLevelId

  const timers = useRef<number[]>([])
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  const later = (fn: () => void, delay: number) => {
    timers.current.push(window.setTimeout(fn, delay))
  }

  const handleRun = () => {
    setError('')
    setBubbles([])
    setStars(0)
    setCelebrating(false)
    setCopied(false)
    setRobotState('idle')

    // ---- The only call site of the checker. Swap in Pyodide later. ----
    const result = checkCode(code, level)

    if (!result.ok) {
      setRobotState('confused')
      setError(result.error?.friendlyMessage ?? SHARED_STRINGS.tryAgain)
      playError()
      return
    }

    const lines = result.outputs
    const condition = level.successCondition
    const spoken = lines.join(' ').trim()

    let problem = ''
    if (condition.minOutputs && lines.length < condition.minOutputs) {
      problem = fill(LESSON_STRINGS.errors.notEnoughLines, { n: condition.minOutputs })
    } else if (condition.changedFromStarter) {
      const untouched = lines.every((line, i) => line === level.starterOutputs[i])
      if (untouched) problem = LESSON_STRINGS.errors.changeIt
    } else if (condition.requiresName) {
      if (!kidName.trim()) {
        problem = LESSON_STRINGS.errors.nameMissing
      } else if (!spoken.toLowerCase().includes(kidName.trim().toLowerCase())) {
        problem = fill(LESSON_STRINGS.errors.nameNotFound, { name: kidName.trim() })
      }
    }

    if (problem) {
      setRobotState('confused')
      setError(problem)
      playError()
      return
    }

    // ---- Success: reveal one bubble per print(), then celebrate. ----
    const earned = hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1
    setStars(earned)
    setRobotState('talking')
    playSuccess()

    const gap = reduceMotion ? 0 : BUBBLE_GAP_MS
    const start = reduceMotion ? 0 : 220

    lines.forEach((_, index) => {
      later(() => setBubbles(lines.slice(0, index + 1)), start + gap * index)
    })

    later(
      () => {
        setRobotState('happy')
        setConfettiTrigger((n) => n + (isLastLevel ? 6 : 1))
        completeLevel(LESSON_ID, level.id, earned, isLastLevel)
        if (isLastLevel) setCelebrating(true)
      },
      start + gap * lines.length + (reduceMotion ? 30 : 450),
    )
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const helper = document.createElement('textarea')
      helper.value = code
      helper.setAttribute('readonly', '')
      helper.style.position = 'fixed'
      helper.style.opacity = '0'
      document.body.appendChild(helper)
      helper.select()
      document.execCommand('copy')
      document.body.removeChild(helper)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2400)
  }

  const handleFinish = () => {
    if (isLastLevel) navigate('/games')
    else onNext()
  }

  return (
    <>
      <ConfettiHelper trigger={confettiTrigger} />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-3xl border border-ink-200/80 bg-surface p-4 shadow-card sm:p-5">
          <CodeEditor
            value={code}
            onChange={setCode}
            height={isFreePlay ? '230px' : '160px'}
            label={SHARED_STRINGS.codeEditor}
          />

          <div className="flex flex-wrap items-center gap-2">
            <RunButton onRun={handleRun} />
            <HintButton
              onHint={() => setHintsUsed((n) => Math.min(n + 1, LESSON_STRINGS.maxHints))}
              used={hintsUsed}
              max={LESSON_STRINGS.maxHints}
            />
            {isFreePlay ? <ShareButton copied={copied} onShare={handleShare} /> : null}
          </div>

          <ul className="flex flex-col gap-2" aria-live="polite">
            <AnimatePresence initial={false}>
              {level.hints.slice(0, hintsUsed).map((hint, index) => (
                <motion.li
                  key={hint}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2.5 rounded-2xl bg-sun-50 px-4 py-3 text-sm leading-relaxed text-sun-900"
                >
                  <span
                    aria-hidden="true"
                    className="mt-px shrink-0 font-mono text-xs font-bold text-sun-700 tabular-nums"
                  >
                    {fill(SHARED_STRINGS.hintNumber, { n: index + 1 })}
                  </span>
                  <span>{hint}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <FriendlyError message={error} />
        </section>

        <section className="relative flex min-h-[340px] flex-col overflow-hidden rounded-3xl border border-python-200/70 bg-linear-to-br from-python-50 via-white to-sun-50 p-4 shadow-card sm:p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-python-200/50 blur-3xl"
          />
          <p className="relative text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
            {SHARED_STRINGS.stage}
          </p>

          <div className="relative flex flex-1 items-center justify-center pt-2">
            <Robot
              state={robotState}
              bubbles={bubbles}
              idleText={
                LESSON_STRINGS.stageIdle[level.id % LESSON_STRINGS.stageIdle.length]!
              }
              label={LESSON_STRINGS.robotLabel}
            />
          </div>

          <p aria-live="polite" className="sr-only">
            {bubbles.join(' ')}
          </p>
        </section>
      </div>

      <AnimatePresence>
        {stars > 0 && !celebrating ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="flex flex-col items-center gap-3 rounded-3xl border border-success-200 bg-linear-to-br from-success-50 to-white p-5 shadow-card sm:flex-row sm:justify-between"
          >
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
              <StarRow stars={stars} starClassName="size-8" />
              <p className="text-sm font-semibold text-success-700">
                {stars === 3
                  ? LESSON_STRINGS.starMessages.three
                  : stars === 2
                    ? LESSON_STRINGS.starMessages.two
                    : LESSON_STRINGS.starMessages.one}
              </p>
            </div>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-python-600 px-6 text-base font-semibold text-white shadow-soft transition-colors hover:bg-python-700 sm:w-auto"
            >
              {SHARED_STRINGS.nextLevel}
              <ChevronRight className="size-4.5" aria-hidden="true" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LevelCompleteModal
        open={celebrating}
        stars={stars}
        isLessonComplete
        body={LESSON_STRINGS.lessonCompleteBody}
        onNext={handleFinish}
        onClose={() => setCelebrating(false)}
      />

      <AnimatePresence>
        {copied && isFreePlay ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-pop"
          >
            <Copy className="size-4" aria-hidden="true" />
            {SHARED_STRINGS.copied}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function ShareButton({ copied, onShare }: { copied: boolean; onShare: () => void }) {
  return (
    <button
      type="button"
      onClick={onShare}
      aria-label={SHARED_STRINGS.share}
      className="inline-flex h-12 items-center gap-2 rounded-2xl border border-ink-200 bg-surface px-4 text-sm font-semibold text-ink-700 shadow-soft transition-colors hover:bg-ink-50"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="inline-flex items-center gap-1.5 text-success-700"
          >
            <Check className="size-4.5" />
            {SHARED_STRINGS.copied}
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <Share2 className="size-4.5" />
            {SHARED_STRINGS.share}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
