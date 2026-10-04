import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Clock, Lock } from 'lucide-react'
import { lessons, module1 } from '../content/lessons/module1'
import { useProgress } from '../context/ProgressContext'
import { LESSON_ICONS } from '../components/layout/navConfig'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'

export function Lessons() {
  const { completedCount, isComplete } = useProgress()
  const total = lessons.length

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Badge tone="brand">Module {module1.number}</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          {module1.title}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
          {module1.description}
        </p>
        <div className="mt-5 max-w-md">
          <ProgressBar
            value={total === 0 ? 0 : completedCount / total}
            label={`${completedCount} of ${total} lessons complete`}
            showValue
          />
        </div>
      </header>

      {/* Linear curriculum — order matters, so this is a vertical track. */}
      <ol className="relative flex flex-col gap-4 border-l border-ink-200 pl-6">
        {lessons.map((lesson, index) => {
          const Icon = LESSON_ICONS[lesson.icon]
          const done = isComplete(lesson.slug)
          const previous = index > 0 ? lessons[index - 1] : undefined
          const locked = Boolean(previous && !isComplete(previous.slug) && !done)

          return (
            <motion.li
              key={lesson.slug}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <span
                aria-hidden="true"
                className={`absolute top-6 -left-[31px] flex size-3.5 items-center justify-center rounded-full border-2 ${
                  done
                    ? 'border-success-500 bg-success-500'
                    : locked
                      ? 'border-ink-300 bg-canvas'
                      : 'border-python-500 bg-surface'
                }`}
              />

              <Card className="transition-shadow hover:shadow-lift">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      done ? 'bg-success-50 text-success-600' : 'bg-python-50 text-python-600'
                    }`}
                  >
                    {done ? <Check className="size-5" /> : locked ? <Lock className="size-5" /> : <Icon className="size-5" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                        Lesson {lesson.order}
                      </span>
                      {done ? <Badge tone="success">Complete</Badge> : null}
                      {!done && locked ? <Badge tone="neutral">Finish lesson {index} first</Badge> : null}
                    </div>

                    <h2 className="mt-1 font-semibold text-ink-900">{lesson.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{lesson.subtitle}</p>

                    <ul className="mt-3 flex flex-col gap-1">
                      {lesson.objectives.slice(0, 2).map((objective) => (
                        <li key={objective} className="flex gap-2 text-xs text-ink-500">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-300" aria-hidden="true" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {lesson.minutes} min
                    </span>
                    <Link
                      to={`/lessons/${lesson.slug}`}
                      className="inline-flex h-9 items-center rounded-lg border border-ink-200 bg-surface px-4 text-sm font-medium text-ink-700 shadow-soft transition-colors hover:border-python-300 hover:bg-python-50 hover:text-python-700"
                    >
                      {done ? 'Review' : locked ? 'Preview' : 'Start'}
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
