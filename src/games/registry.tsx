import { lazy, type ComponentType } from 'react'
import { Box, Sparkles, Zap, type LucideIcon } from 'lucide-react'

/**
 * One row = one playable lesson.
 */
export type GameLesson = {
  /** URL segment: /games/<id>. Folder name and lesson ids must match. */
  id: string
  order: number
  title: string
  description: string
  icon: LucideIcon
  /** Gradient stops for the hub card. Full class strings (Tailwind must see them). */
  gradient: string
  /** Default-exported React component. */
  component: ComponentType
}

const PrintRobotGame = lazy(() => import('./lessons/01-print-robot/index'))
const HeroBuilderGame = lazy(() => import('./lessons/02-hero-builder/index'))
const Lesson3Games = lazy(() => import('./lessons/lesson3/index'))

export const GAMES: GameLesson[] = [
  {
    id: '01-print-robot',
    order: 1,
    title: 'Make the Robot Talk',
    description: 'Teach a robot to speak with print().',
    icon: Zap,
    gradient: 'from-python-400 to-python-600',
    component: PrintRobotGame,
  },
  {
    id: '02-hero-builder',
    order: 2,
    title: 'Hero Builder',
    description: 'Store things in variables and build your own hero.',
    icon: Box,
    gradient: 'from-sun-400 to-sun-600',
    component: HeroBuilderGame,
  },
  {
    id: 'lesson3-games',
    order: 3,
    title: 'Lesson 3 Games: input() and Math',
    description: 'Six fun games to practice input(), int(), and maths.',
    icon: Sparkles,
    gradient: 'from-indigo-400 to-indigo-600',
    component: Lesson3Games,
  },
]

/** Lessons are played in order, so the array order is the unlock order. */
export const GAMES_REGISTRY = GAMES

export function getGameById(id: string | undefined): GameLesson | undefined {
  return GAMES.find((game) => game.id === id)
}

/** True when every lesson before `index` is finished, so this one is playable. */
export function isLessonUnlocked(index: number, isComplete: (id: string) => boolean): boolean {
  if (index <= 0) return true
  return GAMES.slice(0, index).every((game) => isComplete(game.id))
}






