import type { ChallengeCheck } from '../../content/lessons/types'
import type { OutputLine } from '../../lib/python'

export interface CheckResult {
  label: string
  passed: boolean
}

/** Lines the learner typed at a prompt are echoed by the session, not printed. */
const ECHO_PREFIX = '› '

function isProgramOutput(line: OutputLine): boolean {
  return line.stream === 'stdout' && !line.text.startsWith(ECHO_PREFIX)
}

/** Every expected line must appear, in order, inside the actual output. */
function includesInOrder(actual: string[], expected: string[]): boolean {
  let cursor = 0
  for (const line of expected) {
    const found = actual.indexOf(line, cursor)
    if (found === -1) return false
    cursor = found + 1
  }
  return true
}

/**
 * Grade a run against a lesson's checks. Program output must contain each
 * expected line in order; stderr only matters when a check forbids errors.
 */
export function evaluateChecks(checks: ChallengeCheck[], lines: OutputLine[]): CheckResult[] {
  const stdout = lines.filter(isProgramOutput).map((line) => line.text)
  const stderr = lines.filter((line) => line.stream === 'stderr')

  return checks.map((check) => {
    const matched = includesInOrder(stdout, check.expect)
    const clean = check.forbidError ? stderr.length === 0 : true
    return { label: check.label, passed: matched && clean }
  })
}
