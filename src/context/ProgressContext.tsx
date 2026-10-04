import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'python-daily:progress:v1'

export interface LessonProgress {
  completed: boolean
  completedAt: string | null
  /** Fraction of the quiz answered correctly, 0–1. */
  quizBest: number
  /** Last editor contents, so a learner can resume where they left off. */
  code: string | null
  /** Times the challenge was passed. */
  passes: number
}

export interface ProgressData {
  version: 1
  lessons: Record<string, LessonProgress>
  xp: number
  /** ISO date (YYYY-MM-DD) of the most recent completed lesson. */
  lastActive: string | null
}

const EMPTY_LESSON: LessonProgress = {
  completed: false,
  completedAt: null,
  quizBest: 0,
  code: null,
  passes: 0,
}

function emptyData(): ProgressData {
  return { version: 1, lessons: {}, xp: 0, lastActive: null }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function readStorage(): ProgressData {
  if (typeof window === 'undefined') return emptyData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<ProgressData>
    if (parsed.version !== 1) return emptyData()
    return {
      version: 1,
      lessons: parsed.lessons ?? {},
      xp: Number(parsed.xp) || 0,
      lastActive: parsed.lastActive ?? null,
    }
  } catch {
    return emptyData()
  }
}

interface ProgressContextValue {
  data: ProgressData
  getLesson: (slug: string) => LessonProgress
  saveCode: (slug: string, code: string) => void
  recordQuiz: (slug: string, correct: number, total: number) => void
  completeLesson: (slug: string, xpReward: number) => void
  isComplete: (slug: string) => boolean
  completedCount: number
  resetAll: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(readStorage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* private browsing or a full quota — progress stays in memory only */
    }
  }, [data])

  const getLesson = useCallback(
    (slug: string): LessonProgress => data.lessons[slug] ?? EMPTY_LESSON,
    [data.lessons],
  )

  const update = useCallback(
    (slug: string, patch: (prev: LessonProgress) => LessonProgress, xpDelta = 0) => {
      setData((prev) => {
        const before = prev.lessons[slug] ?? EMPTY_LESSON
        const after = patch(before)
        return {
          ...prev,
          lessons: { ...prev.lessons, [slug]: after },
          xp: Math.max(0, prev.xp + xpDelta),
          lastActive: today(),
        }
      })
    },
    [],
  )

  const saveCode = useCallback(
    (slug: string, code: string) => update(slug, (prev) => ({ ...prev, code })),
    [update],
  )

  const recordQuiz = useCallback(
    (slug: string, correct: number, total: number) => {
      const ratio = total > 0 ? correct / total : 0
      update(slug, (prev) => ({ ...prev, quizBest: Math.max(prev.quizBest, ratio) }))
    },
    [update],
  )

  const completeLesson = useCallback(
    (slug: string, xpReward: number) => {
      setData((prev) => {
        const before = prev.lessons[slug] ?? EMPTY_LESSON
        // Replaying a finished lesson must not farm XP.
        const xp = before.completed ? prev.xp : prev.xp + xpReward
        return {
          version: 1,
          xp,
          lastActive: today(),
          lessons: {
            ...prev.lessons,
            [slug]: {
              ...before,
              completed: true,
              completedAt: before.completedAt ?? new Date().toISOString(),
              passes: before.passes + 1,
            },
          },
        }
      })
    },
    [],
  )

  const isComplete = useCallback((slug: string) => data.lessons[slug]?.completed ?? false, [data])

  const completedCount = useMemo(
    () => Object.values(data.lessons).filter((l) => l.completed).length,
    [data.lessons],
  )

  const resetAll = useCallback(() => {
    setData(emptyData())
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* nothing to clear */
    }
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      data,
      getLesson,
      saveCode,
      recordQuiz,
      completeLesson,
      isComplete,
      completedCount,
      resetAll,
    }),
    [data, getLesson, saveCode, recordQuiz, completeLesson, isComplete, completedCount, resetAll],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>')
  return ctx
}
