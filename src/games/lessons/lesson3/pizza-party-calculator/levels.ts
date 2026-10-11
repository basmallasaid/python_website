/**
 * Pizza Party Calculator
 */

export type Level = {
  id: number
  title: string
  mission: string
  code: string
  explain: string[]
  hints: [string, string]
}

export const LESSON_ID = '06-pizza-party-calculator'

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Total Slices',
    mission: 'Ask for number of friends and slices each. Calculate total slices (*).',
    code: '# Ask for numbers\nfriends = int(input("How many friends? "))\nslices_each = int(input("How many slices each? "))\n# Calculate total\nprint("Total slices:", friends * slices_each)',
    explain: ['Use int() to turn text into numbers.', '* means multiply.', 'Print the total.'],
    hints: ['Type whole numbers.', 'Total = friends * slices each.'],
  },
  {
    id: 2,
    title: 'Full Pizzas',
    mission: 'Each pizza has 8 slices. Find how many full pizzas (//).',
    code: '# Ask for numbers\nfriends = int(input("How many friends? "))\nslices_each = int(input("How many slices each? "))\ntotal = friends * slices_each\npizzas = total // 8\n# Show result\nprint("Full pizzas:", pizzas)',
    explain: ['Store total in a variable.', '// gives whole pizzas.', '8 slices per pizza.'],
    hints: ['Use // to drop the remainder.', 'If total is 10, that\'s 1 full pizza.'],
  },
  {
    id: 3,
    title: 'Leftover Slices',
    mission: 'How many slices are left over (%)?',
    code: '# Ask for numbers\nfriends = int(input("How many friends? "))\nslices_each = int(input("How many slices each? "))\ntotal = friends * slices_each\npizzas = total // 8\nleftover = total % 8\n# Show results\nprint("Full pizzas:", pizzas)\nprint("Leftover slices:", leftover)',
    explain: ['% gives the remainder.', 'Print both pizzas and leftovers.'],
    hints: ['10 slices: 10//8=1, 10%8=2.', '% tells us what\'s left.'],
  },
]

export const LESSON_STRINGS = {
  codeTitle: 'The code',
  robotLabel: 'Friendly robot',
  stageIdle: 'Answer the questions and press Run!',
  errors: { empty: 'Please answer all the questions first.', notNumber: 'Type whole numbers only.' },
  starMessages: {
    three: '3 stars! No hints needed. Superstar!',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it - that is what matters.',
  },
  lessonCompleteBody:
    'You calculated pizza slices with * // % and input(). Go back to the Games board and pick your next adventure!',
} as const
