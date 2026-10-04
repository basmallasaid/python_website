import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Lock, Star } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { GAMES, isLessonUnlocked } from '../games/registry'
import { useProgress } from '../games/hooks/useProgress'
import { fill, SHARED_STRINGS } from '../games/strings'

export function GamesHub() {
  const { isLessonComplete, getLessonStars } = useProgress()
  const doneCount = GAMES.filter((game) => isLessonComplete(game.id)).length

  return (
    <div className="flex flex-col gap-8">
      <header className="grid-backdrop relative overflow-hidden rounded-3xl border border-ink-200/80 bg-surface p-6 shadow-card sm:p-8">
        <Badge tone="brand">
          {doneCount}/{GAMES.length}
        </Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          {SHARED_STRINGS.hubTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
          {SHARED_STRINGS.hubIntro}
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((game, index) => {
          const Icon = game.icon
          const done = isLessonComplete(game.id)
          const stars = getLessonStars(game.id)
          const unlocked = isLessonUnlocked(index, isLessonComplete)

          const stateLabel = done
            ? SHARED_STRINGS.completed
            : unlocked
              ? SHARED_STRINGS.playNow
              : SHARED_STRINGS.locked

          return (
            <motion.li
              key={game.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="h-full overflow-hidden p-0 transition-shadow hover:shadow-lift">
                {unlocked ? (
                  <Link
                    to={`/games/${game.id}`}
                    className="flex h-full flex-col gap-4 p-5 focus-visible:outline-none"
                  >
                    <LessonBody
                      icon={<Icon className="size-7" aria-hidden="true" />}
                      gradient={game.gradient}
                      eyebrow={fill(SHARED_STRINGS.lessonLabel, { n: game.order })}
                      title={game.title}
                      description={game.description}
                      done={done}
                      stars={stars}
                      stateLabel={stateLabel}
                      ctaColor="text-python-600"
                    />
                  </Link>
                ) : (
                  <div
                    aria-disabled="true"
                    className="flex h-full cursor-not-allowed flex-col gap-4 p-5 opacity-65"
                  >
                    <LessonBody
                      icon={<Lock className="size-6" aria-hidden="true" />}
                      gradient="from-ink-300 to-ink-400"
                      eyebrow={fill(SHARED_STRINGS.lessonLabel, { n: game.order })}
                      title={game.title}
                      description={game.description}
                      done={false}
                      stars={0}
                      stateLabel={stateLabel}
                      ctaColor="text-ink-500"
                    />
                  </div>
                )}
              </Card>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

function LessonBody({
  icon,
  gradient,
  eyebrow,
  title,
  description,
  done,
  stars,
  stateLabel,
  ctaColor,
}: {
  icon: React.ReactNode
  gradient: string
  eyebrow: string
  title: string
  description: string
  done: boolean
  stars: number
  stateLabel: string
  ctaColor: string
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${gradient} text-white shadow-soft`}
        >
          {icon}
        </span>
        {done ? (
          <Badge tone="success">
            <Check className="size-3.5" aria-hidden="true" />
            {SHARED_STRINGS.completed}
          </Badge>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">{eyebrow}</p>
        <h3 className="mt-0.5 font-semibold text-ink-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">{description}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1" aria-label={fill(SHARED_STRINGS.starsLabel, { n: stars })}>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`size-5 ${i <= stars ? 'fill-sun-400 text-sun-500' : 'text-ink-200'}`}
              aria-hidden="true"
            />
          ))}
        </span>
        <span className={`text-sm font-semibold ${ctaColor}`}>{stateLabel}</span>
      </div>
    </>
  )
}
