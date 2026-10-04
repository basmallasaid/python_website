import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock, Flame, PlayCircle, Target } from 'lucide-react'
import { lessons, module1, nextLesson } from '../content/lessons/module1'
import { useProgress } from '../context/ProgressContext'
import { LESSON_ICONS } from '../components/layout/navConfig'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'

export function Dashboard() {
  const { completedCount, isComplete, data } = useProgress()
  const total = lessons.length
  const pct = total === 0 ? 0 : completedCount / total

  // Resume where the learner left off: the first unfinished lesson.
  const resume = lessons.find((lesson) => !isComplete(lesson.slug)) ?? nextLesson(null)
  const totalXp = lessons.reduce((sum, lesson) => sum + lesson.xp, 0)

  return (
    <div className="flex flex-col gap-8">
      {/* ---- Hero ---- */}
      <section className="grid-backdrop relative overflow-hidden rounded-3xl border border-ink-200/80 bg-surface p-6 shadow-card sm:p-8">
        <div className="max-w-xl">
          <Badge tone="brand">Module 1 · {lessons.length} lessons</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {completedCount === 0
              ? 'Start learning Python today'
              : completedCount === total
                ? 'You finished Module 1'
                : 'Keep your Python streak alive'}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-600">{module1.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={`/lessons/${resume.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-python-600 px-5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-python-700"
            >
              <PlayCircle className="size-4" aria-hidden="true" />
              {completedCount === 0 ? 'Start Lesson 1' : `Continue: Lesson ${resume.order}`}
            </Link>
            <Link
              to="/lessons"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-5 text-sm font-medium text-ink-700 shadow-soft transition-colors hover:bg-ink-50"
            >
              Browse all lessons
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat icon={<Target className="size-4" />} label="Lessons done" value={`${completedCount}/${total}`} />
          <Stat icon={<Flame className="size-4" />} label="XP earned" value={`${data.xp}/${totalXp}`} />
          <Stat
            icon={<Clock className="size-4" />}
            label="Time to finish"
            value={`${lessons.slice(completedCount).reduce((s, l) => s + l.minutes, 0)} min`}
          />
        </div>
      </section>

      {/* ---- Progress ---- */}
      <section>
        <ProgressBar
          value={pct}
          label="Module 1 completion"
          size="lg"
          tone={pct === 1 ? 'success' : 'brand'}
          showValue
        />
      </section>

      {/* ---- Lesson list ---- */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink-900">Module 1 · Python Foundations</h2>
          <Link to="/lessons" className="text-sm font-medium text-python-600 hover:text-python-700">
            View all
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson, index) => {
            const Icon = LESSON_ICONS[lesson.icon]
            const done = isComplete(lesson.slug)
            const locked = index > 0 && !isComplete(lessons[index - 1]!.slug) && !done

            return (
              <motion.li
                key={lesson.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="h-full transition-shadow hover:shadow-lift">
                  <Link
                    to={`/lessons/${lesson.slug}`}
                    className="flex h-full flex-col gap-3 p-4 focus-visible:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                          done ? 'bg-success-50 text-success-600' : 'bg-python-50 text-python-600'
                        }`}
                      >
                        {done ? <Check className="size-5" /> : <Icon className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                          Lesson {lesson.order}
                        </p>
                        <h3 className="mt-0.5 font-semibold text-ink-900">{lesson.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-500">{lesson.subtitle}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {lesson.minutes} min
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lesson.xp} XP</span>
                      {locked ? (
                        <Badge tone="neutral" className="ml-auto">
                          Up next
                        </Badge>
                      ) : null}
                      {done ? (
                        <Badge tone="success" className="ml-auto">
                          Complete
                        </Badge>
                      ) : null}
                    </div>
                  </Link>
                </Card>
              </motion.li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-200/70 bg-canvas/70 px-4 py-3">
      <span className="text-python-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-ink-400 uppercase">{label}</p>
        <p className="font-mono text-sm font-semibold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  )
}
