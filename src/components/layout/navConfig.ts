import {
  BookOpen,
  Calculator,
  Dumbbell,
  Keyboard,
  LayoutDashboard,
  Printer,
  Quote,
  Repeat,
  Split,
  TrendingUp,
  Trophy,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react'
import type { Lesson } from '../../content/lessons/types'

export const LESSON_ICONS: Record<Lesson['icon'], LucideIcon> = {
  printer: Printer,
  box: BookOpen,
  quote: Quote,
  calculator: Calculator,
  keyboard: Keyboard,
  split: Split,
  repeat: Repeat,
  trophy: Trophy,
}

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lessons', label: 'Lessons', icon: BookOpen, end: false },
  { to: '/games', label: 'Games', icon: Gamepad2, end: false },
  { to: '/practice', label: 'Practice', icon: Dumbbell, end: false },
  { to: '/progress', label: 'Progress', icon: TrendingUp, end: false },
] as const
