/**
 * Guess My Number (simple version)
 */

export type Level = {
  id: number
  title: string
  mission: string
  code: string
  explain: string[]
  hints: [string, string]
}

export const LESSON_ID = '09-guess-my-number-simple'

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'See the Output',
    mission: 'Run the starter code and see the output.',
    code: '# The computer picks a secret number\nsecret = 7\n# Ask the player for a guess\nguess = int(input("Guess my number: "))\n# Say what they guessed\nprint(f"You guessed: {guess}. Next lesson we will learn how to check if you are right!")',
    explain: ['The code runs as is.', 'Type a guess when asked.', 'The robot says what you guessed.'],
    hints: ['Just press Run and type a number.', 'You will see the message.'],
  },
  {
    id: 2,
    title: 'Change the Secret',
    mission: 'Change the secret number and print it too.',
    code: '# The computer picks a secret number\nsecret = 9\n# Ask the player for a guess\nguess = int(input("Guess my number: "))\n# Say what they guessed\nprint(f"The secret is {secret}. You guessed: {guess}. Next lesson we will learn how to check if you are right!")',
    explain: ['Change secret = 7 to something else.', 'Add secret to the print.', 'Use f-string to show it.'],
    hints: ['Try secret = 9.', 'Include {secret} in the print.'],
  },
  {
    id: 3,
    title: 'Two Guesses',
    mission: 'Ask for a second guess and print both guesses with an f-string.',
    code: '# The computer picks a secret number\nsecret = 7\n# Ask for guesses\nguess1 = int(input("First guess: "))\nguess2 = int(input("Second guess: "))\n# Say what they guessed\nprint(f"You guessed {guess1} and {guess2}. Next lesson we will learn how to check if you are right!")',
    explain: ['Ask two questions.', 'Save to guess1 and guess2.', 'Print both in one line.'],
    hints: ['Add a second input().', 'Use both variables in f-string.'],
  },
]

export const LESSON_STRINGS = {
  codeTitle: 'The code',
  robotLabel: 'Friendly robot',
  stageIdle: 'Type your guess and press Run!',
  errors: { empty: 'Please type a number.', notNumber: 'Type a whole number only.' },
  starMessages: {
    three: '3 stars! No hints needed. Superstar!',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it - that is what matters.',
  },
  lessonCompleteBody:
    'You guessed numbers with input() and f-strings. Go back to the Games board and pick your next adventure!',
} as const
