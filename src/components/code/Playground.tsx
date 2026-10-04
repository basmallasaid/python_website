import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CircleX, Play, RotateCcw, Sparkles } from 'lucide-react'
import { PythonSession, pyStr, type RunResult } from '../../lib/python'
import type { ChallengeCheck } from '../../content/lessons/types'
import { Button } from '../ui/Button'
import { evaluateChecks, type CheckResult } from './checks'
import { Console } from './Console'
import { PythonEditor } from './PythonEditor'

function snapshot(session: PythonSession): RunResult {
  // The session mutates its state object in place, so hand React a copy.
  const state = session.state
  return { ...state, lines: [...state.lines], variables: [...state.variables] }
}

/**
 * Editor + console + optional pass/fail checks, wired to the in-browser
 * interpreter. The session lives in a ref because it is a mutable imperative
 * object; React only ever sees an immutable snapshot of its state.
 */
export function Playground({
  initialCode,
  checks,
  onCodeChange,
  onPassed,
  caption,
  minRows = 6,
  showSolution = false,
  solution,
}: {
  initialCode: string
  checks?: ChallengeCheck[]
  onCodeChange?: (code: string) => void
  /** Fired the first time every check passes, so progress can be recorded once. */
  onPassed?: () => void
  caption?: string
  minRows?: number
  showSolution?: boolean
  solution?: string
}) {
  const [code, setCode] = useState(initialCode)
  const [session, setSession] = useState(() => new PythonSession())
  const [state, setState] = useState<RunResult>(() => snapshot(session))
  const [results, setResults] = useState<CheckResult[] | null>(null)

  const allPassed = results !== null && results.length > 0 && results.every((r) => r.passed)

  const handleCode = useCallback(
    (next: string) => {
      setCode(next)
      onCodeChange?.(next)
      setResults(null)
    },
    [onCodeChange],
  )

  const run = useCallback(() => {
    setResults(null)
    session.run(code)
    setState(snapshot(session))

    if (checks) {
      // Evaluation is synchronous, so the result is available right away.
      const next = evaluateChecks(checks, session.state.lines)
      setResults(next)
      if (next.every((r) => r.passed)) onPassed?.()
    }
  }, [checks, code, onPassed, session])

  const reset = useCallback(() => {
    setCode(initialCode)
    setResults(null)
    onCodeChange?.(initialCode)
    const fresh = new PythonSession()
    setSession(fresh)
    setState(snapshot(fresh))
  }, [initialCode, onCodeChange])

  const submit = useCallback(
    (value: string) => {
      session.submit(value)
      setState(snapshot(session))
      if (checks) {
        setResults(evaluateChecks(checks, session.state.lines))
      }
    },
    [checks, session],
  )

  const variableEntries = state.variables.map((v) => [v.name, pyStr(v.value)] as const)

  return (
    <div className="flex flex-col gap-3">
      {caption ? <p className="text-sm text-ink-500">{caption}</p> : null}

      <PythonEditor value={code} onChange={handleCode} minRows={minRows} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          onClick={run}
          icon={<Play className="size-3.5" />}
          disabled={state.status === 'running'}
        >
          Run
        </Button>
        <Button variant="ghost" onClick={reset} icon={<RotateCcw className="size-3.5" />}>
          Reset
        </Button>
        {showSolution && solution ? (
          <Button
            variant="ghost"
            className="ml-auto"
            icon={<Sparkles className="size-3.5" />}
            onClick={() => handleCode(solution)}
          >
            Show a solution
          </Button>
        ) : null}
      </div>

      <Console
        lines={state.lines}
        status={state.status}
        prompt={state.prompt}
        durationMs={state.durationMs}
        onSubmit={submit}
      />

      {results ? (
        <motion.ul
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-1.5"
        >
          {results.map((result) => (
            <li key={result.label} className="flex items-center gap-2 text-sm">
              {result.passed ? (
                <Check className="size-4 shrink-0 text-success-600" aria-hidden="true" />
              ) : (
                <CircleX className="size-4 shrink-0 text-danger-500" aria-hidden="true" />
              )}
              <span className={result.passed ? 'text-ink-600' : 'text-ink-700'}>{result.label}</span>
            </li>
          ))}
          {allPassed ? (
            <li className="mt-1 rounded-lg bg-success-50 px-3 py-2 text-sm font-medium text-success-700">
              All checks passed — nice work.
            </li>
          ) : null}
        </motion.ul>
      ) : null}

      {variableEntries.length > 0 ? (
        <div className="rounded-xl border border-ink-200 bg-ink-50 p-3">
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-500 uppercase">
            Variables
          </p>
          <dl className="grid gap-1.5 font-mono text-xs sm:grid-cols-2">
            {variableEntries.map(([name, value]) => (
              <div key={name} className="flex gap-2">
                <dt className="text-python-700">{name}</dt>
                <dd className="truncate text-ink-600">= {value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  )
}
