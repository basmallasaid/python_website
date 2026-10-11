export type CalloutTone = 'tip' | 'warn' | 'note'

export interface LessonSection {
  heading: string
  /** Markdown-lite: `code`, **bold**, and blank-line-separated paragraphs. */
  body: string
  code?: string
  list?: string[]
  callout?: { tone: CalloutTone; title: string; body: string }
  /** A small monospaced box that shows what the code above would output. */
  output?: { title?: string; text: string }
  /** An optional table. Cells accept the same markdown-lite as `body`. */
  table?: { headers: string[]; rows: string[][] }
}

/** One short practice task with a hidden hint and a hidden answer. */
export interface LessonExercise {
  title: string
  prompt: string
  hint: string
  answer: string
}

/** One assertion the challenge solution must satisfy. */
export interface ChallengeCheck {
  label: string
  /** Every line the console must print, in order. */
  expect: string[]
  /** Fail if this Python error appears instead. */
  forbidError?: boolean
}

export interface LessonChallenge {
  prompt: string
  requirements: string[]
  starter: string
  solution: string
  checks: ChallengeCheck[]
  hints: string[]
}

export interface QuizQuestion {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export interface Lesson {
  slug: string
  order: number
  title: string
  subtitle: string
  minutes: number
  /** Key into the lesson icon map. */
  icon:
    | 'printer'
    | 'box'
    | 'quote'
    | 'calculator'
    | 'keyboard'
    | 'message'
    | 'split'
    | 'repeat'
    | 'trophy'
  objectives: string[]
  sections: LessonSection[]
  playground: { starter: string; caption: string }
  challenge: LessonChallenge
  quiz: QuizQuestion[]
  /** Extra mini exercises with a hidden hint and answer. */
  exercises?: LessonExercise[]
  /** When true, the quiz reacts to each pick instead of waiting for a check. */
  instantQuiz?: boolean
  /** Slug of a matching game in the Games section, if one exists. */
  gameSlug?: string
  /** Multiple game slugs for lessons that link to several games. */
  gameSlugs?: string[]
  xp: number
}

export interface Module {
  id: string
  number: number
  title: string
  description: string
  lessons: Lesson[]
}
