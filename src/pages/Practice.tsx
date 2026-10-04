import { useMemo, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Playground } from '../components/code/Playground'
import { CodeBlock } from '../components/code/CodeBlock'

interface Drill {
  id: string
  topic: string
  prompt: string
  starter: string
  solution: string
  checks: { label: string; expect: string[]; forbidError?: boolean }[]
}

const DRILLS: Drill[] = [
  {
    id: 'greeting',
    topic: 'print',
    prompt: 'Print a two-line greeting. Use one print() per line.',
    starter: '',
    solution: 'print("Good morning")\nprint("Good afternoon")\n',
    checks: [
      { label: 'Prints both lines', expect: ['Good morning', 'Good afternoon'] },
      { label: 'No errors', expect: ['Good morning', 'Good afternoon'], forbidError: true },
    ],
  },
  {
    id: 'swap',
    topic: 'variables',
    prompt: 'Swap the values of a and b without a third variable.',
    starter: 'a = 1\nb = 2\n\n',
    solution: 'a = 1\nb = 2\na, b = b, a\n\nprint(a, b)\n',
    checks: [
      { label: 'Prints 2 1', expect: ['2 1'] },
      { label: 'No errors', expect: ['2 1'], forbidError: true },
    ],
  },
  {
    id: 'average',
    topic: 'numbers',
    prompt: 'Print the average of three grades, rounded to one decimal.',
    starter: '',
    solution: 'grades = [88, 92, 79]\n\nprint(f"{sum(grades) / len(grades):.1f}")\n',
    checks: [
      { label: 'Prints 86.3', expect: ['86.3'] },
      { label: 'No errors', expect: ['86.3'], forbidError: true },
    ],
  },
  {
    id: 'fstring',
    topic: 'strings',
    prompt: 'Build a padded label using an f-string and a format spec.',
    starter: 'name = "Ada"\n',
    solution: 'name = "Ada"\n\nprint(f"[{name:>6}]")\n',
    checks: [
      { label: 'Prints [   Ada]', expect: ['[   Ada]'] },
      { label: 'No errors', expect: ['[   Ada]'], forbidError: true },
    ],
  },
  {
    id: 'leap-year',
    topic: 'conditionals',
    prompt: 'Print "leap year" for 2024, otherwise "not a leap year".',
    starter: 'year = 2024\n\n',
    solution:
      'year = 2024\n\nif year % 400 == 0 or (year % 4 == 0 and year % 100 != 0):\n    print("leap year")\nelse:\n    print("not a leap year")\n',
    checks: [
      { label: 'Detects the leap year', expect: ['leap year'] },
      { label: 'No errors', expect: ['leap year'], forbidError: true },
    ],
  },
  {
    id: 'sum-loop',
    topic: 'loops',
    prompt: 'Add up 1 to 10 with a loop and print the total.',
    starter: 'total = 0\n\n',
    solution: 'total = 0\n\nfor i in range(1, 11):\n    total += i\n\nprint(total)\n',
    checks: [
      { label: 'Prints 55', expect: ['55'] },
      { label: 'No errors', expect: ['55'], forbidError: true },
    ],
  },
  {
    id: 'even-odd',
    topic: 'loops',
    prompt: 'Print every even number from 2 to 10.',
    starter: '',
    solution: 'for i in range(2, 11, 2):\n    print(i)\n',
    checks: [
      { label: 'Prints five numbers', expect: ['2', '4', '6', '8', '10'] },
      { label: 'No errors', expect: ['2'], forbidError: true },
    ],
  },
  {
    id: 'count-vowels',
    topic: 'loops',
    prompt: 'Count the vowels in a word and print the count.',
    starter: 'word = "python"\n',
    solution:
      'word = "python"\ncount = 0\n\nfor letter in word:\n    if letter in "aeiou":\n        count += 1\n\nprint(count)\n',
    checks: [
      { label: 'Prints 1', expect: ['1'] },
      { label: 'No errors', expect: ['1'], forbidError: true },
    ],
  },
  {
    id: 'dict-lookup',
    topic: 'dicts',
    prompt: 'Look up a key and print a fallback when it is missing.',
    starter: 'prices = {"apple": 1.5}\n',
    solution:
      'prices = {"apple": 1.5}\nitem = "pear"\n\nprint(prices.get(item, "not found"))\n',
    checks: [
      { label: 'Prints the fallback', expect: ['not found'] },
      { label: 'No errors', expect: ['not found'], forbidError: true },
    ],
  },
  {
    id: 'comprehension',
    topic: 'comprehensions',
    prompt: 'Double every number in the list using a comprehension.',
    starter: 'nums = [1, 2, 3]\n',
    solution: 'nums = [1, 2, 3]\n\nprint([n * 2 for n in nums])\n',
    checks: [
      { label: 'Prints [2, 4, 6]', expect: ['[2, 4, 6]'] },
      { label: 'No errors', expect: ['[2, 4, 6]'], forbidError: true },
    ],
  },
]

export function Practice() {
  const [index, setIndex] = useState(0)
  const [topic, setTopic] = useState('all')

  const topics = useMemo(() => ['all', ...new Set(DRILLS.map((d) => d.topic))], [])
  const visible = useMemo(
    () => (topic === 'all' ? DRILLS : DRILLS.filter((d) => d.topic === topic)),
    [topic],
  )

  const drill = visible[index % visible.length] as Drill

  function next() {
    setIndex((i) => (i + 1) % visible.length)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Badge tone="brand">Practice</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Drills
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
          Short, self-contained problems across everything in Module 1. No progress is
          recorded here — this is for deliberate repetition.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {topics.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setTopic(option)
              setIndex(0)
            }}
            aria-pressed={topic === option}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              topic === option
                ? 'bg-python-600 text-white'
                : 'border border-ink-200 bg-surface text-ink-600 hover:border-python-300 hover:text-python-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge tone="neutral">{drill.topic}</Badge>
            <span className="font-mono text-xs text-ink-400 tabular-nums">
              {visible.length > 1 ? `${(index % visible.length) + 1} / ${visible.length}` : '1 / 1'}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-ink-900">{drill.prompt}</h2>

          <details className="group mt-4">
            <summary className="cursor-pointer text-sm font-medium text-python-600 hover:text-python-700">
              Show the reference solution
            </summary>
            <CodeBlock code={drill.solution} className="mt-3" caption="solution.py" />
          </details>

          <div className="mt-5 border-t border-ink-200/70 pt-4">
            <Button variant="secondary" size="sm" onClick={next} icon={<Shuffle className="size-3.5" />}>
              {visible.length > 1 ? 'Next drill' : 'Restart drill'}
            </Button>
          </div>
        </Card>

        <div className="lg:sticky lg:top-20">
          <Playground
            key={drill.id}
            initialCode={drill.starter}
            checks={drill.checks}
            showSolution
            solution={drill.solution}
          />
        </div>
      </div>
    </div>
  )
}
