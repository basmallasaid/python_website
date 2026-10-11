/**
 * All Mad Libs (Funny Story Maker) game content.
 */

export type Level = {
  id: number
  title: string
  mission: string
  code: string
  explain: string[]
  hints: [string, string]
}

export const LESSON_ID = '04-mad-libs'

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Say Hello',
    mission: 'Ask for a name and print a greeting.',
    code: '# Ask for a name\nname = input("What is your name? ")\n# Print a greeting\nprint(f"Hello {name}, nice to meet you!")',
    explain: [
      'input() asks the question and waits for an answer.',
      'f-string puts the name into the greeting.',
      'print() says the greeting out loud.',
    ],
    hints: [
      'Type your name when the box asks for it.',
      'Press Run to see the greeting.',
    ],
  },
  {
    id: 2,
    title: 'Name and Animal',
    mission: 'Ask for a name and an animal, then print one funny sentence.',
    code: '# Ask for words\nname = input("What is your name? ")\nanimal = input("What is your favorite animal? ")\n# Make a funny sentence\nprint(f"{name} the {animal} just did a silly dance!")',
    explain: [
      'We ask two questions with input().',
      'Each answer is saved in its own variable.',
      'The f-string combines both words into one sentence.',
    ],
    hints: [
      'Answer both questions in order.',
      'Keep the spaces inside the f-string as shown.',
    ],
  },
  {
    id: 3,
    title: 'Four Words Story',
    mission: 'Ask for 4 words and print a 3-line story.',
    code: '# Ask for four words\nname = input("Name: ")\nanimal = input("Animal: ")\nfood = input("Food: ")\nplace = input("Place: ")\n# Print a funny story\nprint(f"{name} saw a giant {animal}!")\nprint(f"It was eating all of the {food}.")\nprint(f"Then they ran to the {place} and laughed!")',
    explain: [
      'Four input() calls ask for four words.',
      'Each answer goes into a different variable.',
      'Three print() lines make a 3-line story.',
    ],
    hints: [
      'Answer all four questions in order.',
      'The story will print three lines when you run it.',
    ],
  },
]

export const LESSON_STRINGS = {
  codeTitle: 'The code',
  robotLabel: 'Friendly robot',
  stageIdle: 'Answer the questions and press Run!',
  errors: {
    empty: 'Please answer all the questions first.',
  },
  starMessages: {
    three: '3 stars! No hints needed. Superstar!',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it - that is what matters.',
  },
  lessonCompleteBody:
    'You made a funny story with input() and f-strings. Go back to the Games board and pick your next adventure!',
} as const
