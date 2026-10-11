import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { QuizQuestion } from '../../content/lessons/types'
import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { RichText } from './LessonSectionBlock'

export function Quiz({
  slug,
  questions,
  onFinish,
  instantFeedback = false,
}: {
  slug: string
  questions: QuizQuestion[]
  onFinish: (correct: number, total: number) => void
  /** When true, each question reacts the moment an option is picked. */
  instantFeedback?: boolean
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)

  const answered = Object.keys(answers).length
  const correct = questions.filter((q, i) => answers[i] === q.answer).length
  const allAnswered = answered === questions.length

  function choose(index: number, option: number) {
    if (instantFeedback) {
      // One pick per question, revealed immediately.
      if (answers[index] !== undefined) return
      const next = { ...answers, [index]: option }
      setAnswers(next)
      if (Object.keys(next).length === questions.length) {
        const score = questions.filter((q, i) => next[i] === q.answer).length
        onFinish(score, questions.length)
      }
      return
    }

    if (checked) return
    setAnswers((prev) => ({ ...prev, [index]: option }))
  }

  function check() {
    setChecked(true)
    onFinish(correct, questions.length)
  }

  function retry() {
    setAnswers({})
    setChecked(false)
  }

  const finished = instantFeedback ? allAnswered : checked

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-surface p-5 shadow-card">
      <h2 className="text-lg font-semibold text-ink-900">Check your understanding</h2>
      <p className="mt-1 mb-5 text-sm text-ink-500">
        {questions.length} questions. You can retake them as many times as you like.
      </p>

      <ol className="flex flex-col gap-6">
        {questions.map((question, qi) => {
          const chosen = answers[qi]
          const right = chosen === question.answer
          const revealed = instantFeedback ? chosen !== undefined : checked
          return (
            <li key={question.prompt}>
              <fieldset disabled={revealed}>
                <legend className="mb-3 flex gap-2 text-[15px] font-medium text-ink-800">
                  <span className="font-mono text-ink-400 tabular-nums">{qi + 1}.</span>
                  <span>
                    <RichText text={question.prompt} />
                  </span>
                </legend>

                <div className="flex flex-col gap-2 pl-6">
                  {question.options.map((option, oi) => {
                    const selected = chosen === oi
                    const isAnswer = oi === question.answer
                    let tone = 'border-ink-200 bg-surface hover:border-python-300 hover:bg-python-50/40'
                    if (revealed && isAnswer) tone = 'border-success-500 bg-success-50'
                    else if (revealed && selected) tone = 'border-danger-500 bg-danger-50'
                    else if (selected) tone = 'border-python-500 bg-python-50'

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => choose(qi, oi)}
                        aria-pressed={selected}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm text-ink-700 transition-colors ${tone}`}
                      >
                        <span>
                          <RichText text={option} />
                        </span>
                        {revealed && isAnswer ? (
                          <Check className="size-4 shrink-0 text-success-600" aria-hidden="true" />
                        ) : null}
                        {revealed && selected && !isAnswer ? (
                          <X className="size-4 shrink-0 text-danger-600" aria-hidden="true" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              {revealed && chosen !== undefined ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 ml-6 rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    right ? 'bg-success-50 text-success-700' : 'bg-warn-50 text-warn-700'
                  }`}
                >
                  <RichText text={question.explanation} />
                </motion.p>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink-200/70 pt-5">
        {instantFeedback ? (
          finished ? (
            <>
              <p className="text-sm text-ink-600">
                You scored <span className="font-semibold text-ink-900">{correct}</span> of{' '}
                {questions.length}.
              </p>
              <Button variant="ghost" size="sm" onClick={retry} className="ml-auto">
                Try again
              </Button>
            </>
          ) : (
            <span className="text-xs text-ink-400">
              {answered} of {questions.length} answered
            </span>
          )
        ) : checked ? (
          <>
            <p className="text-sm text-ink-600">
              You scored <span className="font-semibold text-ink-900">{correct}</span> of{' '}
              {questions.length}.
            </p>
            <Button variant="ghost" size="sm" onClick={retry} className="ml-auto">
              Try again
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={check} disabled={!allAnswered}>
              Check answers
            </Button>
            <span className="text-xs text-ink-400">
              {answered} of {questions.length} answered
            </span>
          </>
        )}
      </div>

      {finished ? (
        <div className="mt-4">
          <ProgressBar
            value={questions.length === 0 ? 0 : correct / questions.length}
            label="Quiz score"
            tone={correct === questions.length ? 'success' : 'warn'}
            showValue
          />
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {finished ? `Quiz scored ${correct} out of ${questions.length} for ${slug}.` : ''}
      </p>
    </div>
  )
}
