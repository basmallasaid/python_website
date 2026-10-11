import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, Sparkles } from 'lucide-react'
import type { LessonExercise } from '../../content/lessons/types'
import { Button } from '../ui/Button'
import { CodeBlock } from '../code/CodeBlock'
import { RichText } from './LessonSectionBlock'

/**
 * The practice block: a few short tasks. Each one has a hidden hint and a
 * hidden answer, so a learner can try first and only peek when they are stuck.
 */
export function Exercises({ exercises }: { exercises: LessonExercise[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink-900">Practice</h2>
      <div className="flex flex-col gap-4">
        {exercises.map((exercise, index) => (
          <ExerciseCard key={exercise.title} exercise={exercise} number={index + 1} />
        ))}
      </div>
    </section>
  )
}

function ExerciseCard({ exercise, number }: { exercise: LessonExercise; number: number }) {
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-python-50 px-2.5 py-0.5 text-xs font-semibold text-python-700 ring-1 ring-inset ring-python-200">
          Exercise {number}
        </span>
        <h3 className="font-semibold text-ink-900">{exercise.title}</h3>
      </div>

      <div className="prose-lesson mt-2">
        <RichText text={exercise.prompt} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHint((value) => !value)}
          icon={<Lightbulb className="size-3.5" />}
          aria-expanded={showHint}
        >
          {showHint ? 'Hide hint' : 'Show hint'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnswer((value) => !value)}
          icon={<Sparkles className="size-3.5" />}
          aria-expanded={showAnswer}
        >
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showHint ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-lg bg-warn-50 px-3 py-2"
          >
            <p className="text-xs font-semibold tracking-wide text-warn-700 uppercase">Hint</p>
            <div className="mt-0.5 text-sm leading-relaxed text-warn-700">
              <RichText text={exercise.hint} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showAnswer ? (
          <motion.div
            key="answer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <CodeBlock code={exercise.answer} caption="answer.py" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
