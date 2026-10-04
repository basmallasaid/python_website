import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, Check, Flame, RotateCcw, Target, Trash2, Trophy } from 'lucide-react'
import { lessons, module1 } from '../content/lessons/module1'
import { useProgress } from '../context/ProgressContext'
import { LESSON_ICONS } from '../components/layout/navConfig'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'

function Ring({ value }: { value: number }) {
  const pct = Math.min(1, Math.max(0, value))
  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-ink-100)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-python-500)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold text-ink-900 tabular-nums">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[11px] text-ink-400">complete</span>
      </div>
    </div>
  )
}

export function Progress() {
  const { data, getLesson, completedCount, resetAll } = useProgress()
  const [confirming, setConfirming] = useState(false)

  const total = lessons.length
  const totalXp = lessons.reduce((sum, lesson) => sum + lesson.xp, 0)
  const pct = total === 0 ? 0 : completedCount / total
  const quizScores = lessons.map((lesson) => ({ lesson, score: getLesson(lesson.slug).quizBest }))
  const quizzesTaken = quizScores.filter((q) => q.score > 0)

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Your progress</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
          Everything here is stored in this browser only. Clearing your browser data will
          reset it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        <Card className="flex items-center gap-6 p-6">
          <Ring value={pct} />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-ink-500">
              <span className="font-mono text-lg font-semibold text-ink-900 tabular-nums">
                {completedCount}
              </span>{' '}
              of {total} lessons done
            </p>
            <p className="text-sm text-ink-500">
              <span className="font-mono text-lg font-semibold text-ink-900 tabular-nums">
                {data.xp}
              </span>{' '}
              of {totalXp} XP
            </p>
            {completedCount === total ? (
              <Badge tone="success" className="mt-2 self-start">
                <Trophy className="size-3" aria-hidden="true" />
                Module 1 complete
              </Badge>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
              <Award className="size-3.5" aria-hidden="true" />
              Quiz average
            </p>
            <p className="mt-2 font-mono text-3xl font-bold text-ink-900 tabular-nums">
              {quizzesTaken.length === 0
                ? '—'
                : `${Math.round(
                    (quizzesTaken.reduce((sum, q) => sum + q.score, 0) / quizzesTaken.length) * 100,
                  )}%`}
            </p>
            <p className="mt-1 text-xs text-ink-400">
              {quizzesTaken.length} of {total} attempted
            </p>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
              <Flame className="size-3.5" aria-hidden="true" />
              Last activity
            </p>
            <p className="mt-2 font-mono text-lg font-semibold text-ink-900">
              {data.lastActive ?? 'Not started'}
            </p>
            <p className="mt-1 text-xs text-ink-400">Keep the streak going</p>
          </Card>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink-900">Lesson breakdown</h2>

        <Card className="divide-y divide-ink-200/70">
          {lessons.map((lesson) => {
            const record = getLesson(lesson.slug)
            const Icon = LESSON_ICONS[lesson.icon]
            return (
              <div key={lesson.slug} className="flex flex-wrap items-center gap-4 p-4">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    record.completed ? 'bg-success-50 text-success-600' : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {record.completed ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">
                    {lesson.order}. {lesson.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {record.completed
                      ? `Completed ${record.completedAt ? new Date(record.completedAt).toLocaleDateString() : ''}`
                      : 'Not started'}
                    {record.passes > 1 ? ` · ${record.passes} runs` : ''}
                  </p>
                </div>

                <div className="w-28 shrink-0">
                  <ProgressBar
                    value={record.quizBest}
                    label="Quiz"
                    size="sm"
                    tone={record.quizBest === 1 ? 'success' : 'warn'}
                    showValue
                  />
                </div>

                <Link
                  to={`/lessons/${lesson.slug}`}
                  className="shrink-0 text-sm font-medium text-python-600 hover:text-python-700"
                >
                  {record.completed ? 'Review' : 'Open'}
                </Link>
              </div>
            )
          })}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink-900">Manage</h2>
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink-900">Reset all progress</p>
              <p className="mt-0.5 text-xs text-ink-500">
                Clears completions, quiz scores, saved code and XP for {module1.title}. This
                cannot be undone.
              </p>
            </div>
          </div>

          {confirming ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="size-3.5" />}
                onClick={() => {
                  resetAll()
                  setConfirming(false)
                }}
              >
                Yes, reset everything
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="size-3.5" />}
              onClick={() => setConfirming(true)}
            >
              Reset progress
            </Button>
          )}
        </Card>
      </section>
    </div>
  )
}
