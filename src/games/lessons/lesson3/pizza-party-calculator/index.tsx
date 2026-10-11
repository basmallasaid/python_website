import { useState, type FormEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Hash, Play, Volume2, VolumeX } from "lucide-react"
import { CodeBlock } from "../../../../components/code/CodeBlock"
import { FriendlyError } from "../../../components/FriendlyError"
import { ConfettiHelper } from "../../../components/ConfettiHelper"
import { LevelCompleteModal, StarRow } from "../../../components/LevelCompleteModal"
import { Robot, type RobotState } from "../../01-print-robot/Robot"
import { useProgress } from "../../../hooks/useProgress"
import { useSounds } from "../../../hooks/useSounds"
import { SHARED_STRINGS } from "../../../strings"
import { LESSON_ID, LESSON_STRINGS, LEVELS } from "./levels"

export default function PizzaPartyCalculatorGame() {
  const navigate = useNavigate(); const reduceMotion = useReducedMotion(); const { completeLevel } = useProgress(); const { playSuccess, playError, muted, toggleMute } = useSounds()
  const level = LEVELS[0]!
  const [friends, setFriends] = useState(""); const [slices, setSlices] = useState("")
  const [error, setError] = useState(""); const [said, setSaid] = useState<string[]>([]); const [robotState, setRobotState] = useState<RobotState>("idle")
  const [stars, setStars] = useState(0); const [celebrating, setCelebrating] = useState(false); const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0); const [showSolution, setShowSolution] = useState(false)

  function handleRun(e: FormEvent) {
    e.preventDefault(); setError("")
    if (!/^-?\d+$/.test(friends.trim()) || !/^-?\d+$/.test(slices.trim())) { setRobotState("confused"); setError(LESSON_STRINGS.errors.notNumber); playError(); return }
    const f = parseInt(friends); const s = parseInt(slices)
    if (level.id === 1) setSaid([`Total slices: ${f * s}`])
    else if (level.id === 2) { const total = f * s; setSaid([`Full pizzas: ${Math.floor(total / 8)}`]) }
    else if (level.id === 3) { const total = f * s; setSaid([`Full pizzas: ${Math.floor(total / 8)}`, `Leftover slices: ${total % 8}`]) }
    const earned = hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1
    setStars(earned); setRobotState("happy"); setConfettiTrigger(n => n + 1); playSuccess(); completeLevel(LESSON_ID, level.id, earned, level.id === LEVELS.length)
    window.setTimeout(() => setCelebrating(true), reduceMotion ? 200 : 1000)
  }

  return (<>
    <ConfettiHelper trigger={confettiTrigger} />
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-ink-200/80 bg-surface p-4 shadow-card sm:p-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Level {level.id} of {LEVELS.length}</p><h2 className="mt-0.5 text-lg font-bold text-ink-900 sm:text-xl">{level.title}</h2></div><button type="button" onClick={toggleMute} aria-label={muted ? SHARED_STRINGS.soundOn : SHARED_STRINGS.soundOff} aria-pressed={!muted} className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-surface text-ink-500 shadow-soft transition-colors hover:bg-ink-50 hover:text-ink-800">{muted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}</button></div>
        <p className="mt-3 text-[15px] leading-relaxed font-medium text-ink-800 sm:text-base">{level.mission}</p>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-3xl border border-ink-200/80 bg-surface p-4 shadow-card sm:p-5">
          <div className="flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-xl bg-python-50 text-python-600"><Hash className="size-4.5" /></span><h2 className="text-base font-bold text-ink-900 sm:text-lg">{LESSON_STRINGS.codeTitle}</h2></div>
          <CodeBlock code={level.code} caption="pizza.py" />
          <ul className="flex flex-col gap-2">{level.explain.map(line => (<li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink-600"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-python-400" /><span>{line}</span></li>))}</ul>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowSolution(s => !s)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3 text-xs font-semibold text-ink-700 shadow-soft hover:bg-ink-50">{showSolution ? "Hide solution" : "Show solution"}</button>
            <button type="button" onClick={() => setHintsUsed(n => Math.min(n + 1, level.hints.length))} disabled={hintsUsed >= level.hints.length} className="inline-flex h-9 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3 text-xs font-semibold text-ink-700 shadow-soft hover:bg-ink-50 disabled:opacity-50">Hint ({hintsUsed}/{level.hints.length})</button>
          </div>
          {showSolution && <CodeBlock code={level.code} caption="solution.py" />}
          <ul className="flex flex-col gap-2">{level.hints.slice(0, hintsUsed).map((h, i) => (<li key={i} className="rounded-xl bg-sun-50 px-3 py-2 text-sm text-sun-900">{h}</li>))}</ul>
        </section>
        <section className="relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-python-200/70 bg-linear-to-br from-python-50 via-white to-sun-50 p-4 shadow-card sm:p-5">
          <p className="relative text-[11px] font-semibold tracking-wide text-ink-400 uppercase">{SHARED_STRINGS.stage}</p>
          <div className="relative flex flex-1 items-center justify-center pt-2"><Robot state={robotState} bubbles={said} idleText={LESSON_STRINGS.stageIdle} label={LESSON_STRINGS.robotLabel} /></div>
          <form onSubmit={handleRun} className="relative mt-4 flex flex-col gap-2">
            <input value={friends} onChange={e => setFriends(e.target.value)} placeholder="How many friends?" className="h-12 rounded-2xl border border-ink-200 bg-surface px-4" />
            <input value={slices} onChange={e => setSlices(e.target.value)} placeholder="How many slices each?" className="h-12 rounded-2xl border border-ink-200 bg-surface px-4" />
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-success-600 px-6 text-base font-semibold text-white shadow-lift hover:bg-success-700"><Play className="size-5" /> {SHARED_STRINGS.run}</button>
            <FriendlyError message={error} />
          </form>
        </section>
      </div>
      <AnimatePresence>{stars > 0 && !celebrating && (<motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} className="flex flex-col items-center gap-3 rounded-3xl border border-success-200 bg-linear-to-br from-success-50 to-white p-5 shadow-card sm:flex-row sm:justify-between"><div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3"><StarRow stars={stars} starClassName="size-8" /><p className="text-sm font-semibold text-success-700">{stars === 3 ? LESSON_STRINGS.starMessages.three : stars === 2 ? LESSON_STRINGS.starMessages.two : LESSON_STRINGS.starMessages.one}</p></div><button type="button" onClick={() => navigate("/games")} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-python-600 px-6 text-base font-semibold text-white shadow-soft hover:bg-python-700 sm:w-auto">{SHARED_STRINGS.hubCta} <ChevronRight className="size-4.5" /></button></motion.div>)}</AnimatePresence>
    </div>
    <LevelCompleteModal open={celebrating} stars={stars} isLessonComplete body={LESSON_STRINGS.lessonCompleteBody} onNext={() => navigate("/games")} onClose={() => setCelebrating(false)} />
  </>)
}
