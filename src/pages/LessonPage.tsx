import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Gamepad2, Lightbulb, Target } from 'lucide-react'
import { getLesson, lessons, nextLesson, prevLesson } from '../content/lessons/module1'
import { useProgress } from '../context/ProgressContext'
import { LESSON_ICONS } from '../components/layout/navConfig'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Playground } from '../components/code/Playground'
import { LessonSectionBlock } from '../components/lesson/LessonSectionBlock'
import { Exercises } from '../components/lesson/Exercises'
import { Quiz } from '../components/lesson/Quiz'
import { VariableLab } from '../components/lesson/VariableLab'

/** The Variable Lab only makes sense while explaining variables. */
function showsVariableLab(slug: string): boolean {
  return slug === 'variables'
}

export function LessonPage() {
  const { slug = '' } = useParams()
  const lesson = getLesson(slug)
  const { getLesson: getProgress, saveCode, recordQuiz, completeLesson } = useProgress()
  // Hints are keyed by slug, so navigating to another lesson hides them
  // without an effect.
  const [hintsFor, setHintsFor] = useState<string | null>(null)
  const hintsOpen = hintsFor === slug

  const savedCode = getProgress(slug).code

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug])

  const handleCodeChange = useCallback(
    (code: string) => saveCode(slug, code),
    [saveCode, slug],
  )

  const handlePassed = useCallback(() => {
    if (!lesson) return
    completeLesson(slug, lesson.xp)
  }, [completeLesson, lesson, slug])

  if (!lesson) return <Navigate to="/lessons" replace />

  const Icon = LESSON_ICONS[lesson.icon]
  const previous = prevLesson(slug)
  const next = nextLesson(slug)
  const isLast = next.slug === slug
  const progress = getProgress(slug)

  return (
    <div className="flex flex-col gap-8">
      {/* ---- Lesson header ---- */}
      <header className="flex flex-col gap-4">
        <Link
          to="/lessons"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-python-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All lessons
        </Link>

        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-python-50 text-python-600">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                Lesson {lesson.order} of {lessons.length}
              </span>
              {progress.completed ? <Badge tone="success">Completed</Badge> : null}
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              {lesson.title}
            </h1>
            <p className="mt-1 text-base text-ink-500">{lesson.subtitle}</p>
          </div>
        </div>

        <Card className="bg-python-50/50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-python-700 uppercase">
            <Target className="size-3.5" aria-hidden="true" />
            By the end you will be able to
          </p>
          <ul className="flex flex-col gap-1.5">
            {lesson.objectives.map((objective) => (
              <li key={objective} className="flex gap-2 text-sm text-ink-700">
                <Check className="mt-0.5 size-4 shrink-0 text-python-500" aria-hidden="true" />
                {objective}
              </li>
            ))}
          </ul>
        </Card>
      </header>

      {/* ---- Desktop: content + sticky playground. Mobile: stacked. ---- */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          {lesson.sections.map((section) => (
            <LessonSectionBlock key={section.heading} section={section} />
          ))}

          {showsVariableLab(slug) ? <VariableLab /> : null}

          {/* ---- Challenge ---- */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-ink-900">Your turn</h2>
            <Card className="p-5">
              <p className="text-[15px] leading-relaxed text-ink-700">{lesson.challenge.prompt}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {lesson.challenge.requirements.map((requirement) => (
                  <li key={requirement} className="flex gap-2 text-sm text-ink-600">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-python-400" aria-hidden="true" />
                    {requirement}
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-ink-200/70 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHintsFor(hintsOpen ? null : slug)}
                  icon={<Lightbulb className="size-3.5" />}
                  aria-expanded={hintsOpen}
                >
                  {hintsOpen ? 'Hide hints' : 'Show a hint'}
                </Button>

                {hintsOpen ? (
                  <motion.ol
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 flex flex-col gap-2 overflow-hidden"
                  >
                    {lesson.challenge.hints.map((hint, index) => (
                      <li
                        key={hint}
                        className="rounded-lg bg-warn-50 px-3 py-2 text-sm leading-relaxed text-warn-700"
                      >
                        <span className="font-semibold">Hint {index + 1}:</span> {hint}
                      </li>
                    ))}
                  </motion.ol>
                ) : null}
              </div>
            </Card>
          </section>

          {lesson.exercises && lesson.exercises.length > 0 ? (
            <Exercises exercises={lesson.exercises} />
          ) : null}

          <Quiz
            slug={slug}
            questions={lesson.quiz}
            instantFeedback={lesson.instantQuiz}
            onFinish={(correct, total) => recordQuiz(slug, correct, total)}
          />

          {lesson.gameSlug ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-ink-900">Games</h2>
              <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-python-50 text-python-600">
                    <Gamepad2 className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">Guess My Number</p>
                    <p className="mt-0.5 text-sm text-ink-500">
                      Play a quick game that uses input() and maths.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/games/${lesson.gameSlug}`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-python-600 px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-python-700"
                >
                  Play now
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Card>
            </section>
          ) : lesson.gameSlugs && lesson.gameSlugs.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-ink-900">Games</h2>
              <div className="flex flex-col gap-3">
                {lesson.gameSlugs.map((slug) => (
                  <Card key={slug} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-python-50 text-python-600">
                        <Gamepad2 className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-ink-900">
                          {slug === 'lesson3-games' ? 'Lesson 3 Games: input() and Math' : 'Guess My Number'}
                        </p>
                        <p className="mt-0.5 text-sm text-ink-500">
                          Play games that use input() and maths.
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/games/${slug}`}
                      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-python-600 px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-python-700"
                    >
                      Play now
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* ---- Sticky practice panel ---- */}
        <aside className="lg:sticky lg:top-20">
          <Card className="flex flex-col gap-4 p-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Practice</h2>
              <p className="mt-0.5 text-xs text-ink-500">
                Runs in your browser. Nothing is sent anywhere.
              </p>
            </div>

            <Playground
              key={slug}
              initialCode={savedCode ?? lesson.challenge.starter}
              checks={lesson.challenge.checks}
              onCodeChange={handleCodeChange}
              onPassed={handlePassed}
              solution={lesson.challenge.solution}
              showSolution
            />
          </Card>

          <div className="mt-4">
            <Playground
              initialCode={lesson.playground.starter}
              caption={lesson.playground.caption}
              minRows={4}
            />
          </div>
        </aside>
      </div>

      {/* ---- Lesson navigation ---- */}
      <nav className="flex flex-col gap-3 border-t border-ink-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link
            to={`/lessons/${previous.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-python-600"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[11px] tracking-wide text-ink-400 uppercase">Previous</span>
              <span className="truncate">{previous.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {isLast ? (
          <Link
            to="/progress"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-python-600"
          >
            <span className="text-right">
              <span className="block text-[11px] tracking-wide text-ink-400 uppercase">Finish</span>
              <span>See your progress</span>
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ) : (
          <Link
            to={`/lessons/${next.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-python-600"
          >
            <span className="text-right">
              <span className="block text-[11px] tracking-wide text-ink-400 uppercase">Next</span>
              <span className="truncate">{next.title}</span>
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  )
}

