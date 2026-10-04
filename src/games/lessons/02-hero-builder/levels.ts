/**
 * All Lesson 2 content: level data + every UI string the lesson shows.
 * Nothing user-facing is hardcoded inside the components — not even the
 * checker's error messages, which live in `LESSON_STRINGS.checkerErrors`.
 */

import type { CheckResult } from './checker'
import { fill } from '../../strings'

export type LevelSuccessCondition = {
  /** The variable has to exist after the code runs. */
  hasVariable?: string
  /** The variable has to hold a number bigger than `min`. */
  minNumber?: { name: string; min: number }
  /** The variable has to hold one of these words (any case). */
  oneOf?: { name: string; values: string[] }
  /** The variable's final value must differ from what the starter code gives. */
  changedFromStarter?: string
  /** print() has to be called with this variable inside it. */
  printsVariable?: string
  /** At least this many print() lines. */
  minOutputs?: number
  /** Every one of these variables has to exist. */
  requiresAllVariables?: string[]
}

export type Level = {
  id: number
  title: string
  mission: string
  starterCode: string
  /** What the starter code produces — used to tell "changed it" from "left it". */
  starterVariables: Record<string, string | number>
  hints: [string, string, string]
  successCondition: LevelSuccessCondition
}

export const LESSON_ID = '02-hero-builder'
export const MAX_HINTS = 3

/** The last level: free play + share + lesson badge. */
export const FREE_PLAY_LEVEL_ID = 7

/** The colors the hero card knows how to wear. Level 4 asks for one of these. */
export const HERO_COLORS = ['red', 'blue', 'gold', 'purple', 'green'] as const

export type HeroColor = (typeof HERO_COLORS)[number]

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Make your first box',
    mission: 'A variable is a box with a name tag. Press Run and watch the box appear! 📦',
    starterCode: 'hero_name = "Zed"',
    starterVariables: { hero_name: 'Zed' },
    hints: [
      'Just press the big green Run button.',
      'hero_name is the name on the box. "Zed" is the value inside it.',
      'Your code already works — press Run!',
    ],
    successCondition: { hasVariable: 'hero_name' },
  },
  {
    id: 2,
    title: 'Change what is inside',
    mission: 'Now change the value inside the box to any name you like. The hero changes too!',
    starterCode: 'hero_name = "Zed"',
    starterVariables: { hero_name: 'Zed' },
    hints: [
      'Change Zed to a different name.',
      'Keep the quote marks " " around your name.',
      'For example: hero_name = "Nova"',
    ],
    successCondition: { hasVariable: 'hero_name', changedFromStarter: 'hero_name' },
  },
  {
    id: 3,
    title: 'Make the hero strong',
    mission: 'Power is a number. Set power to a number BIGGER than 50 and watch the hero glow! ⚡',
    starterCode: 'hero_name = "Zed"\npower = 10',
    starterVariables: { hero_name: 'Zed', power: 10 },
    hints: [
      'Find the line that says power = 10.',
      'Swap 10 for a bigger number, like 90.',
      'Numbers do not need quotes: power = 90',
    ],
    successCondition: { hasVariable: 'power', minNumber: { name: 'power', min: 50 } },
  },
  {
    id: 4,
    title: 'Pick a suit color',
    mission: 'Set color to one of the suit colors and the hero gets a new outfit! 🎨',
    starterCode: 'hero_name = "Zed"\ncolor = "grey"',
    starterVariables: { hero_name: 'Zed', color: 'grey' },
    hints: [
      'Replace grey with a real suit color.',
      `The colors are: ${HERO_COLORS.join(', ')}.`,
      'For example: color = "purple"',
    ],
    successCondition: { hasVariable: 'color', oneOf: { name: 'color', values: [...HERO_COLORS] } },
  },
  {
    id: 5,
    title: 'Talk with variables',
    mission: 'print() can say a variable. Introduce your hero with print(hero_name).',
    starterCode: 'hero_name = "Zed"\ncolor = "blue"\nprint("I am ")',
    starterVariables: { hero_name: 'Zed', color: 'blue' },
    hints: [
      'A box can go inside print(), without quotes.',
      'Try print(hero_name) — no " " around it!',
      'You can say more too: print("I am", hero_name)',
    ],
    successCondition: { printsVariable: 'hero_name', minOutputs: 1 },
  },
  {
    id: 6,
    title: 'Fix the bugs',
    mission: 'This code is broken in two places. Fix it and your hero appears. 🔧',
    starterCode: 'hero name = "Zed"\npower = "80',
    starterVariables: { hero_name: 'Zed', power: 80 },
    hints: [
      'Line 1 has a space inside the name. Names cannot do that.',
      'Join the name with an underscore: hero_name = "Zed"',
      'Then line 2: "80 is a number, so it does not need quotes. Try power = 80',
    ],
    successCondition: {
      hasVariable: 'hero_name',
      requiresAllVariables: ['hero_name', 'power'],
      minNumber: { name: 'power', min: 0 },
    },
  },
  {
    id: 7,
    title: 'Free play',
    mission: 'Build the whole hero — name, power, coins and color — then introduce them! 🎉',
    starterCode:
      '# Build your hero, then introduce them!\nhero_name = "Zed"\npower = 60\ncoins = 3\ncolor = "blue"\nprint(hero_name)',
    starterVariables: { hero_name: 'Zed', power: 60, coins: 3, color: 'blue' },
    hints: [
      'Keep the 4 boxes: hero_name, power, coins and color.',
      'Coins are a number, like coins = 12',
      'Finish with print(hero_name) — or print("Meet", hero_name)!',
    ],
    successCondition: {
      requiresAllVariables: ['hero_name', 'power', 'coins', 'color'],
      printsVariable: 'hero_name',
      minOutputs: 1,
    },
  },
]

export const LESSON_STRINGS = {
  freePlayLevelId: FREE_PLAY_LEVEL_ID,
  maxHints: MAX_HINTS,
  supportedColors: HERO_COLORS.join(', '),

  variablesLabel: 'Your boxes',
  variablesEmpty: 'No boxes yet. Press Run to make one! 📦',
  variablesHint: 'A box has a name on the tag and a value inside.',
  boxEmpty: 'empty',
  boxLineTag: 'Line {n}',

  robotLabel: 'Friendly robot',
  stageIdle: [
    'Waiting for your code…',
    'Press Run and watch!',
    'Your boxes will pop in here 📦',
    'Ready when you are!',
  ],

  hero: {
    cardLabel: 'Your hero',
    defaultName: '???',
    powerLabel: 'Power',
    coinsLabel: 'Coins',
    colorLabel: 'Suit',
    powerStrong: 'Strong!',
    powerWeak: 'Sleepy…',
    powerMax: 'MAX POWER!',
    powerUnknown: '—',
  },

  starMessages: {
    three: '3 stars! No hints needed. superstar! 🌟',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it — that is what matters. 💪',
  },

  lessonCompleteBody:
    'You built a hero with variables. Go back to the Games board and pick your next adventure!',

  /** Friendly wording for every failure `checker.ts` can report. */
  checkerErrors: {
    emptyCode: 'Your code looks empty. Try hero_name = "Zed" and press Run.',
    missingEquals: 'You forgot the = sign. That is what puts a value inside a box.',
    nameHasSpace: "Variable names can't have spaces. Try {suggestion} 🙂",
    nameStartsWithNumber: 'Names cannot start with a number. Try a_name instead of {name}.',
    invalidName: 'Use only letters, numbers and _ in a name. Try hero_name instead of {name}.',
    missingName: 'A box needs a name first. Try hero_name = "Zed".',
    missingValue: 'The box is empty. Put something after the = sign.',
    missingQuotes: 'You forgot the closing quote ". 🙂',
    missingParen: 'You forgot the closing bracket )',
    textOutsideQuotes: 'Words need quote marks. Try hero_name = "Zed".',
    unknownVariable: "Python doesn't know '{name}' yet. Create it first!",
    wrongCase: 'Python cares about capital letters. Use {correct}, not {name}.',
    unknownStatement: 'This lesson only knows = and print(). Keep it simple!',
    extraCharacters: 'There is something extra at the end of the line. Remove it.',
    emptyPrint: 'print() needs something inside. Try print("Hi!").',
  },

  /** Why the code ran fine but did not finish the mission yet. */
  errors: {
    missingVariable: "I can't find a box called {name}. Make it first!",
    raiseNumber: 'Make {name} bigger than {min}, like {name} = {example}.',
    pickOne: 'Set {name} to one of these: {options}',
    changeIt: 'Nice try! Now put a different value inside the box.',
    notEnoughLines: 'Almost! Say it at least {n} time(s).',
    printIt: 'Use print({name}) — no quote marks around a variable.',
  },
} as const

export type SuccessResult = { ok: true } | { ok: false; message: string }

/**
 * Data-driven success check.
 *
 * Lives here (not in the component) so the mission rules stay next to the level
 * data they belong to. Returns a kid-readable reason instead of throwing, so
 * the UI can show it in the same `FriendlyError` box as a parse error.
 */
export function evaluateLevel(result: CheckResult, level: Level): SuccessResult {
  const condition = level.successCondition
  const variables = result.variables
  const errors = LESSON_STRINGS.errors

  if (condition.hasVariable && !(condition.hasVariable in variables)) {
    return { ok: false, message: fill(errors.missingVariable, { name: condition.hasVariable }) }
  }

  if (condition.requiresAllVariables) {
    const missing = condition.requiresAllVariables.find((name) => !(name in variables))
    if (missing) {
      return { ok: false, message: fill(errors.missingVariable, { name: missing }) }
    }
  }

  if (condition.minNumber) {
    const { name, min } = condition.minNumber
    const value = variables[name]
    if (typeof value !== 'number' || value <= min) {
      return {
        ok: false,
        message: fill(errors.raiseNumber, { name, min: min + 1, example: min + 40 }),
      }
    }
  }

  if (condition.oneOf) {
    const { name, values } = condition.oneOf
    const value = variables[name]
    if (typeof value !== 'string' || !values.includes(value.toLowerCase())) {
      return { ok: false, message: fill(errors.pickOne, { name, options: values.join(', ') }) }
    }
  }

  if (condition.changedFromStarter) {
    const name = condition.changedFromStarter
    if (variables[name] === level.starterVariables[name]) {
      return { ok: false, message: errors.changeIt }
    }
  }

  if (condition.minOutputs && result.outputs.length < condition.minOutputs) {
    return { ok: false, message: fill(errors.notEnoughLines, { n: condition.minOutputs }) }
  }

  if (condition.printsVariable) {
    const name = condition.printsVariable
    const used = result.steps.some((step) => step.type === 'print' && step.name === name)
    if (!used) return { ok: false, message: fill(errors.printIt, { name }) }
  }

  return { ok: true }
}