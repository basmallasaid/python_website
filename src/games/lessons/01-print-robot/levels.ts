/**
 * All Lesson 1 content: level data + every UI string the lesson shows.
 * Nothing user-facing is hardcoded inside the components.
 */

export type LevelSuccessCondition = {
  /** How many print() lines the robot has to say. */
  minOutputs?: number
  /** The output must contain the name the kid typed in. */
  requiresName?: boolean
  /** The kid has to change the starter text. */
  changedFromStarter?: boolean
  /** The starter code is broken on purpose. */
  buggy?: boolean
}

export type Level = {
  id: number
  title: string
  mission: string
  starterCode: string
  /** What the robot says when the starter code runs as-is. Used for level 2. */
  starterOutputs: string[]
  hints: [string, string, string]
  successCondition: LevelSuccessCondition
}

export const LESSON_ID = '01-print-robot'
export const MAX_HINTS = 3

/** The level that asks for the kid's name before it can be solved. */
export const ASK_NAME_LEVEL_ID = 3
/** The last level: free play + share + lesson badge. */
export const FREE_PLAY_LEVEL_ID = 6

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Press Run',
    mission: 'Your code is ready! Press Run and watch the robot say it out loud. 🤖',
    starterCode: 'print("Hello!")',
    starterOutputs: ['Hello!'],
    hints: [
      'Just press the big green Run button.',
      'print("…") is how you tell Python to say something.',
      'Your code already works. Go press Run!',
    ],
    successCondition: {},
  },
  {
    id: 2,
    title: 'Change the words',
    mission: 'Now change the words inside the quotes to anything you like.',
    starterCode: 'print("Hello!")',
    starterOutputs: ['Hello!'],
    hints: [
      'Change Hello! to your own words.',
      'Keep the quote marks " " around your words.',
      'Like this: print("Hi, I am a robot!")',
    ],
    successCondition: { changedFromStarter: true },
  },
  {
    id: 3,
    title: 'Say your name',
    mission: 'Tell the robot your name. Your words must include it!',
    starterCode: 'print("My name is Sam")',
    starterOutputs: ['My name is Sam'],
    hints: [
      'Change Sam to your real name.',
      'You can add more words too.',
      'For example: print("Hi everyone, I am Ada!")',
    ],
    successCondition: { requiresName: true },
  },
  {
    id: 4,
    title: 'Two lines',
    mission: 'Make the robot say two things. Use two print() lines!',
    starterCode: 'print("Hello!")\nprint("Nice to meet you!")',
    starterOutputs: ['Hello!', 'Nice to meet you!'],
    hints: [
      'You need two print() lines, one under the other.',
      'Every line needs its own quote marks and brackets.',
      'Copy the starter code, then change both messages.',
    ],
    successCondition: { minOutputs: 2 },
  },
  {
    id: 5,
    title: 'Fix the bug',
    mission: 'This code is broken in two places. Fix it so the robot can talk! 🔧',
    starterCode: 'print("Hello!)\nprint("I am missing a bracket"',
    starterOutputs: ['Hello!', 'I am missing a bracket'],
    hints: [
      'Line 1 is missing something at the end of the words.',
      'Every word needs a closing quote ". Add it after Hello!',
      'Then line 1 also needs a closing bracket ) — and line 2 is missing one too.',
    ],
    successCondition: { buggy: true },
  },
  {
    id: 6,
    title: 'Free play',
    mission: 'Free play! Write 3 funny lines for the robot, then share your code. 🎉',
    starterCode: 'print("Beep boop!")\nprint("I am a dancing robot!")\nprint("Press Run to see my show!")',
    starterOutputs: ['Beep boop!', 'I am a dancing robot!', 'Press Run to see my show!'],
    hints: [
      'Write 3 print() lines with any words you like.',
      'Bigger story? Try splitting it across 3 lines.',
      'Happy with it? Press Share code to copy it.',
    ],
    successCondition: { minOutputs: 3 },
  },
]

export const LESSON_STRINGS = {
  askNameLevelId: ASK_NAME_LEVEL_ID,
  freePlayLevelId: FREE_PLAY_LEVEL_ID,
  maxHints: MAX_HINTS,

  robotLabel: 'Friendly robot',

  /** Shown on the stage while nothing has been run yet. */
  stageIdle: ['Ready when you are!', 'Press Run to make me talk.', 'I am waiting… 🤖'],

  namePrompt: {
    question: 'First, what is your name?',
    label: 'Your name',
    placeholder: 'Type your name',
  },
  nameDone: {
    text: 'Nice to meet you, {name}!',
  },

  errors: {
    notEnoughLines: 'Almost! The robot needs {n} lines. Add one more print().',
    nameMissing: 'Tell me your name first, then try again.',
    nameNotFound: 'I cannot find the name {name} in your message. Try adding it!',
    changeIt: 'Nice try! Now change the words inside the quotes to your own.',
  },

  starMessages: {
    three: '3 stars! No hints needed. superstar! 🌟',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it — that is what matters. 💪',
  },

  lessonCompleteBody:
    'You taught a robot how to talk. Go back to the Games board and pick your next adventure!',
} as const
