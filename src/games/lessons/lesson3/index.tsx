import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  Check,
  Hash,
  Pizza,
  Rocket,
  Shield,
  Timer,
} from "lucide-react"
import { useProgress } from "../../hooks/useProgress"
import { StarRow } from "../../components/LevelCompleteModal"
import MadLibsGame from "./mad-libs"
import SuperheroNameMakerGame from "./superhero-name-maker"
import PizzaPartyCalculatorGame from "./pizza-party-calculator"
import TimeMachineGame from "./time-machine"
import SpaceTripGame from "./space-trip"
import GuessMyNumberGame from "./guess-my-number"
import { LESSON_ID as ML } from "./mad-libs/levels"
import { LESSON_ID as SH } from "./superhero-name-maker/levels"
import { LESSON_ID as PP } from "./pizza-party-calculator/levels"
import { LESSON_ID as TM } from "./time-machine/levels"
import { LESSON_ID as ST } from "./space-trip/levels"
import { LESSON_ID as GN } from "./guess-my-number/levels"

const GAMES = [
  { id: "mad-libs", title: "Mad Libs", description: "Ask for words and build a funny story.", icon: BookOpen, component: MadLibsGame, lessonId: ML },
  { id: "superhero-name-maker", title: "Superhero Name Maker", description: "Ask for words and build a superhero name.", icon: Shield, component: SuperheroNameMakerGame, lessonId: SH },
  { id: "pizza-party-calculator", title: "Pizza Party Calculator", description: "Use *, // and % to split pizza slices.", icon: Pizza, component: PizzaPartyCalculatorGame, lessonId: PP },
  { id: "time-machine", title: "Time Machine", description: "Add, multiply and square your age.", icon: Timer, component: TimeMachineGame, lessonId: TM },
  { id: "space-trip", title: "Space Trip", description: "Divide distance by speed to blast off.", icon: Rocket, component: SpaceTripGame, lessonId: ST },
  { id: "guess-my-number", title: "Guess My Number", description: "Ask for a guess with input() and int().", icon: Hash, component: GuessMyNumberGame, lessonId: GN },
] as const

export default function Lesson3Games() {
  const [active, setActive] = useState<(typeof GAMES)[number]["id"]>("mad-libs")
  const { isLessonComplete, getLessonStars } = useProgress()

  const completed = GAMES.filter((g) => isLessonComplete(g.lessonId)).length
  const totalStars = GAMES.reduce((s, g) => s + getLessonStars(g.lessonId), 0)
  const ActiveComp = GAMES.find((g) => g.id === active)!.component

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-ink-200/80 bg-surface p-4 shadow-card sm:p-5">
        <h2 className="text-lg font-bold text-ink-900 sm:text-xl">Lesson 3 Games: input() and Math</h2>
        <p className="mt-1 text-sm text-ink-500">
          Practice input(), int(), + - * / // % **, and f-strings. Pick a game below.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-600">
          <span>{completed} of {GAMES.length} games completed</span>
          <span className="flex items-center gap-1">
            <StarRow stars={3} starClassName="size-4" />
            <span className="text-xs text-ink-500">
              {totalStars} of {GAMES.length * 3} stars
            </span>
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => {
            const Icon = g.icon
            const done = isLessonComplete(g.lessonId)
            const stars = getLessonStars(g.lessonId)
            const isActive = active === g.id
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActive(g.id)}
                aria-pressed={isActive}
                className={`flex flex-col gap-2 rounded-2xl border p-3 text-left transition-colors ${
                  isActive
                    ? "border-python-600 bg-python-600 text-white shadow-lift"
                    : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`flex size-8 items-center justify-center rounded-xl ${isActive ? "bg-white/15 text-white" : "bg-python-50 text-python-600"}`}>
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  {done ? (
                    <Check className={`size-4 ${isActive ? "text-white" : "text-success-600"}`} aria-label="Completed" />
                  ) : (
                    <StarRow stars={stars} starClassName={`size-3.5 ${isActive ? "text-sun-300" : ""}`} />
                  )}
                </span>
                <span className="text-sm font-semibold leading-tight">{g.title}</span>
                <span className={`text-xs leading-snug ${isActive ? "text-python-100" : "text-ink-500"}`}>
                  {g.description}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-ink-900">
              {GAMES.find((g) => g.id === active)!.title}
            </h3>
            <button
              type="button"
              onClick={() => setActive("mad-libs")}
              className="hidden text-sm font-medium text-python-600 hover:text-python-700"
            >
              Back to menu
            </button>
          </div>
          <ActiveComp />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}