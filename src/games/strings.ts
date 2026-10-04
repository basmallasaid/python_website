/**
 * Shared UI strings for the whole Games section.
 *
 * Everything a kid reads that is NOT lesson-specific lives here, so the whole
 * section can be translated by editing this file (plus each lesson's
 * `levels.js`). Components must never hardcode user-facing text.
 */
export const SHARED_STRINGS = {
  // Hub + page chrome
  hubTitle: 'Games',
  hubIntro: 'Learn Python by playing. Finish one game to unlock the next one.',
  playNow: 'Play now',
  playAgain: 'Play again',
  locked: 'Locked',
  completed: 'Completed',
  lessonLabel: 'Lesson {n}',
  starsLabel: '{n} of 3 stars',
  hubCta: 'Back to Games',
  loading: 'Warming up the robots…',

  // Game page
  stage: 'Stage',
  codeEditor: 'Python code editor',
  levelOf: 'Level {n} of {total}',
  levelProgress: 'Level progress',
  previousLevel: 'Previous level',
  nextLevelNav: 'Next level',
  goToLevel: 'Go to level {n}: {title}',
  run: 'Run my code',
  hint: 'Hint',
  hintNumber: 'Hint {n}',
  nextLevel: 'Next level',
  tryAgain: 'Try again',
  share: 'Share code',
  copied: 'Copied!',
  soundOn: 'Turn sound on',
  soundOff: 'Turn sound off',
  continue: 'Let’s go',
  starsEarned: 'You earned {n} stars',

  // Celebration
  levelComplete: 'Level complete!',
  lessonComplete: 'Lesson complete!',
  lessonCompleteBadge: 'Badge earned',

  // 404
  unknownLessonTitle: 'Oops, that game is hiding',
  unknownLessonBody:
    'We could not find a game with that name. Try picking a lesson from the Games board.',
} as const

/** Replace `{token}` placeholders in a shared or lesson string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
