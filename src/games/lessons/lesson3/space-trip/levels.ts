/**
 * Space Trip
 */

export type Level = {
  id: number
  title: string
  mission: string
  code: string
  explain: string[]
  hints: [string, string]
}

export const LESSON_ID = '08-space-trip'

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Travel Time in Hours',
    mission: 'Ask for distance (km) and speed (km/h). Hours = distance / speed.',
    code: '# Ask for numbers\ndistance = int(input("Distance to planet (km)? "))\nspeed = int(input("Rocket speed (km/h)? "))\n# Calculate\nhours = distance / speed\nprint("Travel time in hours:", hours)',
    explain: ['/ means division (gives a number).', 'Store in hours variable.', 'Print it.'],
    hints: ['Divide distance by speed.', 'Use / (not //) for hours.'],
  },
  {
    id: 2,
    title: 'Travel Time in Days',
    mission: 'Calculate days = hours // 24.',
    code: '# Ask for numbers\ndistance = int(input("Distance to planet (km)? "))\nspeed = int(input("Rocket speed (km/h)? "))\nhours = distance / speed\ndays = hours // 24\nprint("Days:", days)',
    explain: ['// drops the remainder.', '24 hours in a day.', 'Print days.'],
    hints: ['Use // for whole days.', 'Divide hours by 24.'],
  },
  {
    id: 3,
    title: 'Full Trip Report',
    mission: 'Print a full report with an f-string.',
    code: '# Ask for numbers\ndistance = int(input("Distance to planet (km)? "))\nspeed = int(input("Rocket speed (km/h)? "))\nhours = distance / speed\ndays = hours // 24\n# Report\nprint(f"Distance: {distance} km, Speed: {speed} km/h")\nprint(f"Hours: {hours}, Days: {days}")',
    explain: ['f-strings mix words and numbers.', 'Two print lines make a report.'],
    hints: ['Use f-strings for a neat report.', 'Include all numbers.'],
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
    'You blasted off to space with /, // and f-strings. Go back to the Games board and pick your next adventure!',
} as const
