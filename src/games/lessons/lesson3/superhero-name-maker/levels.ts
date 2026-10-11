/**
 * All Superhero Name Maker game content.
 */

export type Level = {
  id: number
  title: string
  mission: string
  code: string
  explain: string[]
  hints: [string, string]
}

export const LESSON_ID = '05-superhero-name-maker'

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Hero Name',
    mission: 'Ask for favorite color and animal, then print a superhero name.',
    code: '# Ask for words\ncolor = input("What is your favorite color? ")\nanimal = input("What is your favorite animal? ")\n# Make a superhero name\nprint(f"Superhero name: Captain {color} {animal}")',
    explain: [
      'input() collects two answers.',
      'An f-string builds the hero name.',
    ],
    hints: [
      'Answer both questions.',
      'The name combines color and animal.',
    ],
  },
  {
    id: 2,
    title: 'Add Your Name',
    mission: 'Add the child\'s name too.',
    code: '# Ask for words\ncolor = input("What is your favorite color? ")\nanimal = input("What is your favorite animal? ")\nname = input("What is your name? ")\n# Print hero name and real name\nprint(f"Captain {color} {animal}, also known as {name}")',
    explain: [
      'Now we ask for three answers.',
      'We put them all in the f-string.',
    ],
    hints: [
      'Answer all three questions.',
      'Keep the commas and words the same.',
    ],
  },
  {
    id: 3,
    title: 'Add a Superpower',
    mission: 'Add a made-up superpower line.',
    code: '# Ask for words\ncolor = input("What is your favorite color? ")\nanimal = input("What is your favorite animal? ")\nname = input("What is your name? ")\n# Print hero info\nprint(f"Captain {color} {animal}, also known as {name}")\nprint(f"Superpower: {color} lightning speed!")',
    explain: [
      'We print two lines now.',
      'The superpower uses f-strings too.',
    ],
    hints: [
      'Two print lines are used.',
      'The second line adds the superpower.',
    ],
  },
]

export const LESSON_STRINGS = {
  codeTitle: 'The code',
  robotLabel: 'Friendly robot',
  stageIdle: 'Answer the questions and press Run!',
  errors: { empty: 'Please answer all the questions first.' },
  starMessages: {
    three: '3 stars! No hints needed. Superstar!',
    two: '2 stars! One hint helped you along.',
    one: '1 star! You did it - that is what matters.',
  },
  lessonCompleteBody:
    'You made a superhero name with input() and f-strings. Go back to the Games board and pick your next adventure!',
} as const
