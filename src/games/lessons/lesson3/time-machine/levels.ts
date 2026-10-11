/**
 * Time Machine
 */

export type Level = {
  id: number
  title: string
  mission: string
  code: string
  explain: string[]
  hints: [string, string]
}

export const LESSON_ID = '07-time-machine'

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Age in 10 Years',
    mission: 'Ask for age (int()) and print age in 10 years.',
    code: '# Ask for age\nage = int(input("How old are you? "))\n# Calculate\nprint("In 10 years you will be", age + 10)',
    explain: ['int() turns input into a number.', '+ adds numbers.', 'Print the result.'],
    hints: ['Type your age.', 'Add 10 to age.'],
  },
  {
    id: 2,
    title: 'Days Lived',
    mission: 'Print about how many days you have lived (age * 365).',
    code: '# Ask for age\nage = int(input("How old are you? "))\n# Calculate days\nprint("You have lived about", age * 365, "days")',
    explain: ['* means multiply.', 'We use 365 days as a simple estimate.'],
    hints: ['Multiply age by 365.', 'No need for decimal places.'],
  },
  {
    id: 3,
    title: 'Bonus',
    mission: 'Print age in 20 years and age doubled (**2).',
    code: '# Ask for age\nage = int(input("How old are you? "))\n# Calculate\nprint("In 20 years:", age + 20)\nprint("Age doubled:", age ** 2)',
    explain: ['+ adds.', '** gives power (bonus).', 'Print two lines.'],
    hints: ['**2 means age times age.', 'Print both results.'],
  },
]

export const LESSON_STRINGS = {
  codeTitle: 'The code',
  robotLabel: 'Friendly robot',
  stageIdle: 'Answer the question and press Run!',
  errors: { empty: 'Please answer the question first.', notNumber: 'Type a whole number.' },
  starMessages: {
    three: '3 stars! No hints needed. Superstar!',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it - that is what matters.',
  },
  lessonCompleteBody:
    'You traveled through time with input() and maths. Go back to the Games board and pick your next adventure!',
} as const
