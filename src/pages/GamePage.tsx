import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, SearchX } from 'lucide-react'
import { getGameById } from '../games/registry'
import { SHARED_STRINGS } from '../games/strings'

export function GamePage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const game = getGameById(lessonId)

  if (!game) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="grid-backdrop flex flex-col items-center gap-4 rounded-3xl border border-ink-200/80 bg-surface p-8 text-center shadow-card"
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-warn-100 text-warn-600">
          <SearchX className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">
          {SHARED_STRINGS.unknownLessonTitle}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-ink-600">
          {SHARED_STRINGS.unknownLessonBody}
        </p>
        <Link
          to="/games"
          className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-python-600 px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-python-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {SHARED_STRINGS.hubCta}
        </Link>
      </motion.section>
    )
  }

  const GameComponent = game.component
  const Icon = game.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/games"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 text-sm font-medium text-ink-700 shadow-soft transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {SHARED_STRINGS.hubCta}
        </Link>

        <span className="flex items-center gap-2.5">
          <span
            className={`flex size-9 items-center justify-center rounded-xl bg-linear-to-br ${game.gradient} text-white`}
          >
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-ink-900">{game.title}</span>
        </span>
      </div>

      <Suspense
        fallback={
          <div className="rounded-3xl border border-ink-200/80 bg-surface p-10 text-center text-ink-500 shadow-card">
            {SHARED_STRINGS.loading}
          </div>
        }
      >
        <GameComponent />
      </Suspense>
    </motion.div>
  )
}
