import { useCallback, useState } from 'react'

const STORAGE_KEY = 'zoomix-games-progress-v1'

/** Everything the Games section remembers about one lesson. */
export type LessonProgress = {
  /** levelId (as a string) -> the kid solved it. */
  completedLevels: Record<string, boolean>
  /** levelId (as a string) -> best stars earned on it (1-3). */
  levelStars: Record<string, number>
  lessonComplete: boolean
  /** Best stars across the lesson's levels — what the hub shows. */
  lessonStars: number
  /** Small pieces of state a level needs to remember, e.g. the kid's name. */
  values: Record<string, string>
}

type Store = Record<string, LessonProgress>

const emptyLesson = (): LessonProgress => ({
  completedLevels: {},
  levelStars: {},
  lessonComplete: false,
  lessonStars: 0,
  values: {},
})

function readStore(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Store
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: Store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* private mode or quota — the game still works, it just forgets. */
  }
}

/**
 * Game progress in localStorage, one bucket per lesson.
 *
 * The hub reads `lessonComplete` / `lessonStars`; a game component reads and
 * writes the level keys through `completeLevel`, `setValue` and `getValue`.
 */
export function useProgress() {
  // localStorage is the source of truth, so seed state from it directly.
  const [store, setStore] = useState<Store>(readStore)

  const update = useCallback((lessonId: string, recipe: (lesson: LessonProgress) => LessonProgress) => {
    setStore((prev) => {
      const current = prev[lessonId] ?? emptyLesson()
      const next = { ...prev, [lessonId]: recipe(current) }
      writeStore(next)
      return next
    })
  }, [])

  const getLesson = useCallback(
    (lessonId: string): LessonProgress => store[lessonId] ?? emptyLesson(),
    [store],
  )

  /** Records a solved level. Returns nothing — the caller already knows. */
  const completeLevel = useCallback(
    (lessonId: string, levelId: number | string, stars: number, lessonComplete = false) => {
      update(lessonId, (lesson) => {
        const key = String(levelId)
        return {
          ...lesson,
          completedLevels: { ...lesson.completedLevels, [key]: true },
          levelStars: { ...lesson.levelStars, [key]: Math.max(lesson.levelStars[key] ?? 0, stars) },
          lessonStars: Math.max(lesson.lessonStars, stars),
          lessonComplete: lesson.lessonComplete || lessonComplete,
        }
      })
    },
    [update],
  )

  const setValue = useCallback(
    (lessonId: string, key: string, value: string) => {
      update(lessonId, (lesson) => ({ ...lesson, values: { ...lesson.values, [key]: value } }))
    },
    [update],
  )

  const getValue = useCallback(
    (lessonId: string, key: string) => store[lessonId]?.values[key] ?? '',
    [store],
  )

  const isLessonComplete = useCallback((lessonId: string) => store[lessonId]?.lessonComplete ?? false, [store])

  const getLessonStars = useCallback((lessonId: string) => store[lessonId]?.lessonStars ?? 0, [store])

  const getLevelStars = useCallback(
    (lessonId: string, levelId: number | string) => store[lessonId]?.levelStars[String(levelId)] ?? 0,
    [store],
  )

  const reset = useCallback((lessonId: string) => {
    setStore((prev) => {
      const next = { ...prev }
      delete next[lessonId]
      writeStore(next)
      return next
    })
  }, [])

  return {
    getLesson,
    completeLevel,
    setValue,
    getValue,
    isLessonComplete,
    getLessonStars,
    getLevelStars,
    reset,
  }
}
