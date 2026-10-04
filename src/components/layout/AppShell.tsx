import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, Menu, X } from 'lucide-react'
import { useProgress } from '../../context/ProgressContext'
import { lessons } from '../../content/lessons/module1'
import { Button } from '../ui/Button'
import { LESSON_ICONS, NAV_ITEMS } from './navConfig'

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-python-600 font-mono text-sm font-bold text-white shadow-soft">
        Py
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-ink-900">Python Daily</span>
        <span className="text-[11px] text-ink-500">Learn by doing</span>
      </span>
    </Link>
  )
}

function JourneyProgress() {
  const { completedCount } = useProgress()
  const total = lessons.length
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100)

  return (
    <div className="rounded-xl border border-ink-200/80 bg-python-50/70 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-python-700 uppercase">
          Your Python Journey
        </span>
        <span className="font-mono text-xs font-medium text-python-700 tabular-nums">
          {completedCount}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Module 1 completion"
        className="h-2 overflow-hidden rounded-full bg-white"
      >
        <motion.div
          className="h-full rounded-full bg-python-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2 text-xs text-ink-600">
        {completedCount === 0
          ? 'Start with Lesson 1 — it takes five minutes.'
          : completedCount === total
            ? 'Module 1 complete. Nicely done.'
            : `${total - completedCount} lesson${total - completedCount === 1 ? '' : 's'} to go.`}
      </p>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { isComplete } = useProgress()

  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-python-50 text-python-700'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                }`
              }
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
          Module 1
        </p>
        <ul className="flex flex-col gap-0.5">
          {lessons.map((lesson) => {
            const Icon = LESSON_ICONS[lesson.icon]
            const done = isComplete(lesson.slug)
            return (
              <li key={lesson.slug}>
                <NavLink
                  to={`/lessons/${lesson.slug}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                      isActive
                        ? 'bg-ink-100 font-medium text-ink-900'
                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                    }`
                  }
                >
                  <span className="w-5 shrink-0 text-center font-mono text-[11px] text-ink-400 tabular-nums">
                    {lesson.order}
                  </span>
                  <Icon className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                  {done ? (
                    <Check className="size-3.5 shrink-0 text-success-600" aria-label="Completed" />
                  ) : null}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  // Tie the drawer to the route it was opened on, so navigating closes it
  // without needing an effect.
  const [drawerRoute, setDrawerRoute] = useState<string | null>(null)
  const menuOpen = drawerRoute === location.pathname

  const { data } = useProgress()

  const openMenu = () => setDrawerRoute(location.pathname)
  const closeMenu = () => setDrawerRoute(null)

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* ---- Desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-200/80 bg-surface lg:flex">
        <div className="px-4 py-5">
          <Brand />
        </div>
        <SidebarNav />
        <div className="px-4 pb-5">
          <JourneyProgress />
        </div>
      </aside>

      {/* ---- Mobile drawer ---- */}
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-ink-200 bg-surface lg:hidden"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between px-4 py-5">
                <Brand />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  icon={<X className="size-4" />}
                />
              </div>
              <SidebarNav onNavigate={closeMenu} />
              <div className="px-4 pb-5">
                <JourneyProgress />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* ---- Main column ---- */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-ink-200/80 bg-canvas/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={openMenu}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              icon={<Menu className="size-4" />}
            />

            <div className="lg:hidden">
              <Brand />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-ink-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-600 sm:inline-flex">
                <Flame className="size-3.5 text-warn-500" aria-hidden="true" />
                {data.xp} XP
              </span>
              <Link
                to="/lessons"
                className="rounded-full bg-python-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-soft transition-colors hover:bg-python-700"
              >
                Keep learning
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="px-4 py-6 sm:px-6 sm:py-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-6xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
