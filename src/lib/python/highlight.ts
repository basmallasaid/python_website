import { BUILTIN_NAMES } from './builtins'
import { KEYWORDS } from './tokenizer'

export type HighlightKind =
  | 'keyword'
  | 'builtin'
  | 'string'
  | 'fstring'
  | 'number'
  | 'comment'
  | 'operator'
  | 'punctuation'
  | 'function'
  | 'plain'

export interface HighlightSpan {
  text: string
  kind: HighlightKind
}

export const HIGHLIGHT_CLASS: Record<HighlightKind, string> = {
  keyword: 'text-sun-300 font-medium',
  builtin: 'text-python-300',
  string: 'text-emerald-300',
  fstring: 'text-emerald-300',
  number: 'text-orange-300',
  comment: 'text-ink-500 italic',
  operator: 'text-python-200',
  punctuation: 'text-ink-400',
  function: 'text-sun-200',
  plain: 'text-ink-100',
}

const BUILTIN_SET = new Set(BUILTIN_NAMES)

/**
 * Lightweight, error-tolerant Python highlighter for display.
 *
 * Unlike the tokenizer this never throws, so it can highlight half-written code
 * in the editor. The alternation is ordered so longer constructs win.
 */
const TOKEN_RE = new RegExp(
  [
    '(?<comment>#[^\\n]*)',
    '(?<string>[fFrRbBuU]{0,2}(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'))',
    '(?<number>(?:0[xXoObB][0-9a-fA-F_]+|\\d[\\d_]*\\.?[\\d_]*(?:[eE][+-]?\\d+)?)(?![A-Za-z_0-9.]))',
    '(?<word>[A-Za-z_][A-Za-z0-9_]*)',
    '(?<operator>\\*\\*|//|==|!=|<=|>=|[-+*/%@<>=!]=?|\\||\\^|~|&)',
    '(?<punctuation>[(){}\\[\\],;:.]|::)',
    '(?<plain>[ \\t\\n]+)',
    '(?<other>[\\s\\S])',
  ].join('|'),
  'g',
)

export function highlightPython(source: string): HighlightSpan[] {
  const spans: HighlightSpan[] = []
  let previousWord = ''
  TOKEN_RE.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = TOKEN_RE.exec(source)) !== null) {
    const groups = match.groups ?? {}
    const text = match[0]

    let kind: HighlightKind
    if (groups['comment']) kind = 'comment'
    else if (groups['string']) kind = /^[fF]/.test(text) ? 'fstring' : 'string'
    else if (groups['number']) kind = 'number'
    else if (groups['word']) kind = wordKind(groups['word'], previousWord)
    else if (groups['operator']) kind = 'operator'
    else if (groups['punctuation']) kind = 'punctuation'
    else kind = 'plain'

    if (groups['word']) previousWord = groups['word']
    else if (!groups['plain']) previousWord = ''

    spans.push({ text, kind })
  }

  return spans
}

function wordKind(word: string, previous: string): HighlightKind {
  if (KEYWORDS.has(word)) return 'keyword'
  if (BUILTIN_SET.has(word)) return 'builtin'
  if (previous === '.') return 'function'
  return 'plain'
}
