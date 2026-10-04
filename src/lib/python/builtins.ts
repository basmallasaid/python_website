import { PyError } from './errors'
import {
  compareValues,
  deleteKey,
  Float,
  isDict,
  isList,
  isNumber,
  iterate,
  lengthOf,
  lookupKey,
  numVal,
  pyRepr,
  pyStr,
  pyTypeName,
  setKey,
  truthy,
  TypeObject,
  valuesEqual,
  type PyDict,
  type PyValue,
} from './values'

export type Builtin = (args: PyValue[], line: number, kw: Record<string, PyValue>) => PyValue

const wantNumber = (name: string, value: PyValue, line: number): number => {
  if (!isNumber(value)) {
    throw new PyError(
      'TypeError',
      `${name}() argument must be a number, not '${pyTypeName(value)}'`,
      line,
    )
  }
  return numVal(value)
}

const wantIterable = (name: string, value: PyValue, line: number): PyValue[] => {
  try {
    return iterate(value, line)
  } catch {
    throw new PyError(
      'TypeError',
      `${name}() argument must be iterable, not '${pyTypeName(value)}'`,
      line,
    )
  }
}

/** `range` is materialised as a list — simpler and fast enough for lessons. */
const pyRange = (args: PyValue[], line: number): PyValue => {
  let start = 0
  let stop = 0
  let step = 1

  if (args.length === 1) {
    stop = wantNumber('range', args[0] as PyValue, line)
  } else if (args.length === 2 || args.length === 3) {
    start = wantNumber('range', args[0] as PyValue, line)
    stop = wantNumber('range', args[1] as PyValue, line)
    step = args.length === 3 ? wantNumber('range', args[2] as PyValue, line) : 1
  } else {
    throw new PyError(
      'TypeError',
      `range expected 1 to 3 arguments, got ${args.length}`,
      line,
    )
  }

  if (step === 0) throw new PyError('ValueError', 'range() arg 3 must not be zero', line)

  const out: PyValue[] = []
  const count = step > 0 ? Math.ceil((stop - start) / step) : Math.ceil((start - stop) / -step)
  const capped = Math.min(Math.max(count, 0), 1_000_000)
  for (let i = 0; i < capped; i++) out.push(start + i * step)
  return out
}

const pyInt = (args: PyValue[], line: number): PyValue => {
  const value = args[0]
  if (typeof value === 'boolean') return value ? 1 : 0
  if (isNumber(value)) return Math.trunc(numVal(value))
  if (typeof value === 'string') {
    const text = value.trim()
    const base = args.length > 1 ? wantNumber('int', args[1] as PyValue, line) : 10
    const parsed = base === 10 ? Number(text) : parseInt(text, base)
    if (text === '' || Number.isNaN(parsed)) {
      throw new PyError(
        'ValueError',
        `invalid literal for int() with base ${base}: ${pyRepr(value)}`,
        line,
      )
    }
    return Math.trunc(parsed)
  }
  throw new PyError(
    'TypeError',
    `int() argument must be a string or number, not '${pyTypeName(value as PyValue)}'`,
    line,
  )
}

const pyFloat = (args: PyValue[], line: number): PyValue => {
  const value = args[0]
  if (typeof value === 'boolean') return new Float(value ? 1 : 0)
  if (isNumber(value)) return new Float(numVal(value))
  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    if (value.trim() === '' || Number.isNaN(parsed)) {
      throw new PyError(
        'ValueError',
        `could not convert string to float: ${pyRepr(value)}`,
        line,
      )
    }
    return new Float(parsed)
  }
  throw new PyError(
    'TypeError',
    `float() argument must be a string or number, not '${pyTypeName(value as PyValue)}'`,
    line,
  )
}

/** Python rounds halves to the nearest *even* number: `round(0.5) == 0`. */
const halfToEven = (value: number): number => {
  const floor = Math.floor(value)
  const diff = value - floor
  if (diff > 0.5) return floor + 1
  if (diff < 0.5) return floor
  return floor % 2 === 0 ? floor : floor + 1
}

const pyRound = (args: PyValue[], line: number): PyValue => {
  const raw = args[0] as PyValue
  const value = wantNumber('round', raw, line)
  const digitsArg = args[1]

  // `round(x)` returns an int; `round(x, n)` keeps the float type.
  if (digitsArg === undefined) return halfToEven(value)

  const digits = wantNumber('round', digitsArg, line)
  const factor = Math.pow(10, digits)
  const result = halfToEven(value * factor) / factor
  const clean = Object.is(result, -0) ? 0 : result
  return raw instanceof Float ? new Float(clean) : clean
}

const pySorted = (args: PyValue[], line: number, kw: Kwargs = {}): PyValue => {
  const items = wantIterable('sorted', args[0] as PyValue, line)
  if ('key' in kw) {
    throw new PyError(
      'NotImplementedError',
      'sorted(key=...) needs functions, which arrive in Module 3',
      line,
    )
  }
  const copy = [...items]
  const reverse = truthy(kwArg(kw, args, 'reverse', 1) ?? false)
  copy.sort((a, b) => compareValues(a, b, line))
  if (reverse) copy.reverse()
  return copy
}

const pyMinMax = (name: 'min' | 'max', args: PyValue[], line: number): PyValue => {
  if (args.length === 0) {
    throw new PyError('ValueError', `${name}() arg is an empty sequence`, line)
  }
  if (args.length === 1) {
    const items = wantIterable(name, args[0] as PyValue, line)
    if (items.length === 0) {
      throw new PyError('ValueError', `${name}() arg is an empty sequence`, line)
    }
    return items.reduce((best, item) =>
      compareValues(item, best, line) * (name === 'min' ? 1 : -1) < 0 ? item : best,
    )
  }
  let best = args[0] as PyValue
  for (let i = 1; i < args.length; i++) {
    const candidate = args[i] as PyValue
    const cmp = compareValues(candidate, best, line)
    if (name === 'min' ? cmp < 0 : cmp > 0) best = candidate
  }
  return best
}

export const BUILTINS: Record<string, Builtin> = {
  print: () => null, // handled by the interpreter so output can be streamed

  len: (args, line) => lengthOf(args[0] as PyValue, line),

  int: pyInt,
  float: pyFloat,

  str: (args) => pyStr(args[0] as PyValue),

  bool: (args) => truthy(args[0] as PyValue),

  list: (args) => (args.length === 0 ? [] : wantIterable('list', args[0] as PyValue, 0)),

  abs: (args, line) => Math.abs(wantNumber('abs', args[0] as PyValue, line)),

  round: pyRound,

  min: (args, line) => pyMinMax('min', args, line),
  max: (args, line) => pyMinMax('max', args, line),

  sum: (args, line) => {
    const items = wantIterable('sum', args[0] as PyValue, line)
    const start = args.length > 1 ? wantNumber('sum', args[1] as PyValue, line) : 0
    let total = start
    for (const item of items) total += wantNumber('sum', item, line)
    return total
  },

  range: pyRange,

  reversed: (args, line) => [...wantIterable('reversed', args[0] as PyValue, line)].reverse(),

  sorted: pySorted,

  enumerate: (args, line) => {
    const items = wantIterable('enumerate', args[0] as PyValue, line)
    const start = args.length > 1 ? wantNumber('enumerate', args[1] as PyValue, line) : 0
    return items.map((item, index) => [start + index, item] as PyValue)
  },

  zip: (args, line) => {
    const lists = args.map((arg) => wantIterable('zip', arg, line))
    const shortest = Math.min(...lists.map((l) => l.length))
    const out: PyValue[] = []
    for (let i = 0; i < shortest; i++) {
      out.push(lists.map((l) => l[i] as PyValue) as PyValue)
    }
    return out
  },

  any: (args, line) => wantIterable('any', args[0] as PyValue, line).some(truthy),
  all: (args, line) => wantIterable('all', args[0] as PyValue, line).every(truthy),

  type: (args) => new TypeObject(pyTypeName(args[0] as PyValue)),

  pow: (args, line) => {
    const base = wantNumber('pow', args[0] as PyValue, line)
    const exponent = wantNumber('pow', args[1] as PyValue, line)
    return base ** exponent
  },

  divmod: (args, line) => {
    const a = wantNumber('divmod', args[0] as PyValue, line)
    const b = wantNumber('divmod', args[1] as PyValue, line)
    if (b === 0) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero', line)
    return [Math.floor(a / b), a - Math.floor(a / b) * b]
  },

  chr: (args, line) => String.fromCodePoint(wantNumber('chr', args[0] as PyValue, line)),
  ord: (args, line) => {
    const value = args[0] as PyValue
    if (typeof value !== 'string' || Array.from(value).length !== 1) {
      throw new PyError('TypeError', 'ord() expected a character, but string of length != 1 found', line)
    }
    return Array.from(value)[0]!.codePointAt(0)!
  },

  dict: () => new Map() as PyDict,

  input: () => null, // handled by the interpreter (needs the user)

  help: () =>
    'Available in this playground: print, len, input, int, float, str, bool, list, abs, round, min, max, sum, range, reversed, sorted, enumerate, zip, any, all, type, pow, divmod, chr, ord, dict.',
}

export const BUILTIN_NAMES = Object.keys(BUILTINS)

/* ------------------------------ value methods ----------------------------- */

type Kwargs = Record<string, PyValue>
type Method = (self: PyValue, args: PyValue[], line: number, kw: Kwargs) => PyValue

/** Read a keyword argument, falling back to a positional one. */
function kwArg(kw: Kwargs, args: PyValue[], name: string, index: number): PyValue | undefined {
  return name in kw ? kw[name] : args[index]
}

const wantString = (name: string, value: PyValue | undefined, line: number): string => {
  if (typeof value !== 'string') {
    throw new PyError(
      'TypeError',
      `${name}() argument must be str, not ${pyTypeName(value as PyValue)}`,
      line,
    )
  }
  return value
}

const strMethods: Record<string, Method> = {
  upper: (self) => (self as string).toUpperCase(),
  lower: (self) => (self as string).toLowerCase(),
  title: (self) =>
    (self as string).replace(/\w\S*/g, (word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase()),
  capitalize: (self) => {
    const text = self as string
    return text ? text[0]!.toUpperCase() + text.slice(1).toLowerCase() : text
  },
  strip: (self, args, line) => {
    const text = self as string
    return args.length ? trimWith(text, wantString('strip', args[0], line)) : text.trim()
  },
  lstrip: (self, args, line) => {
    const text = self as string
    return args.length ? trimStartWith(text, wantString('lstrip', args[0], line)) : text.trimStart()
  },
  rstrip: (self, args, line) => {
    const text = self as string
    return args.length ? trimEndWith(text, wantString('rstrip', args[0], line)) : text.trimEnd()
  },
  split: (self, args, line) => {
    const text = self as string
    if (args.length === 0 || args[0] === null) return text.trim().split(/\s+/).filter(Boolean)
    const sep = wantString('split', args[0], line)
    if (sep === '') throw new PyError('ValueError', 'empty separator', line)
    return text.split(sep)
  },
  rsplit: (self, args, line) => {
    const text = self as string
    if (args.length === 0 || args[0] === null) return text.trim().split(/\s+/).filter(Boolean)
    const sep = wantString('rsplit', args[0], line)
    const max = args.length > 1 ? Number(args[1]) : -1
    if (max < 0) return text.split(sep)
    const parts = text.split(sep)
    if (parts.length <= max + 1) return parts
    const head = parts.slice(0, parts.length - max)
    return [...head, parts.slice(parts.length - max).join(sep)]
  },
  join: (self, args, line) => {
    const items = wantIterable('join', args[0] as PyValue, line)
    const bad = items.find((item) => typeof item !== 'string')
    if (bad !== undefined) {
      throw new PyError(
        'TypeError',
        `sequence item: expected str instance, ${pyTypeName(bad)} found`,
        line,
      )
    }
    return items.join(self as string)
  },
  replace: (self, args, line) => {
    const from = wantString('replace', args[0], line)
    const to = wantString('replace', args[1], line)
    const count = args.length > 2 ? Number(args[2]) : Infinity
    return args.length > 2
      ? splitJoin(self as string, from, to, count)
      : (self as string).split(from).join(to)
  },
  find: (self, args, line) => {
    const needle = wantString('find', args[0], line)
    return (self as string).indexOf(needle, args.length > 1 ? Number(args[1]) : 0)
  },
  index: (self, args, line) => {
    const needle = wantString('index', args[0], line)
    const index = (self as string).indexOf(needle)
    if (index === -1) throw new PyError('ValueError', 'substring not found', line)
    return index
  },
  count: (self, args, line) => {
    const needle = wantString('count', args[0], line)
    if (!needle) return Array.from(self as string).length + 1
    return (self as string).split(needle).length - 1
  },
  startswith: (self, args, line) =>
    (self as string).startsWith(wantString('startswith', args[0], line)),
  endswith: (self, args, line) =>
    (self as string).endsWith(wantString('endswith', args[0], line)),
  isdigit: (self) => {
    const text = self as string
    return text.length > 0 && !Number.isNaN(Number(text))
  },
  isalpha: (self) => {
    const text = self as string
    return text.length > 0 && Array.from(text).every((c) => /[a-z]/i.test(c))
  },
  isspace: (self) => {
    const text = self as string
    return text.length > 0 && text.trim() === ''
  },
  isupper: (self) => {
    const text = self as string
    return /[a-z]/i.test(text) && text === text.toUpperCase()
  },
  islower: (self) => {
    const text = self as string
    return /[a-z]/i.test(text) && text === text.toLowerCase()
  },
  zfill: (self, args, line) => {
    const width = Number(args[0] ?? 0)
    if (Number.isNaN(width)) throw new PyError('TypeError', 'zfill() width must be a number', line)
    const text = self as string
    if (text.length >= width) return text
    const pad = '0'.repeat(width - text.length)
    return /^[+-]/.test(text) ? text[0] + pad + text.slice(1) : pad + text
  },
  rjust: (self, args) => justify(self, args, 'left'),
  ljust: (self, args) => justify(self, args, 'right'),
  center: (self, args) => justify(self, args, 'center'),
}

function justify(
  self: PyValue,
  args: PyValue[],
  mode: 'left' | 'right' | 'center',
): PyValue {
  const width = Number(args[0] ?? 0)
  const fill = args.length > 1 ? String(args[1]) : ' '
  const text = self as string
  if (text.length >= width) return text
  const padTotal = width - text.length
  if (mode === 'left') return text + fill.repeat(padTotal)
  if (mode === 'right') return fill.repeat(padTotal) + text
  const left = Math.floor(padTotal / 2)
  return fill.repeat(left) + text + fill.repeat(padTotal - left)
}


function trimWith(text: string, chars: string): string {
  let start = 0
  let end = text.length
  while (start < end && chars.includes(text[start]!)) start += 1
  while (end > start && chars.includes(text[end - 1]!)) end -= 1
  return text.slice(start, end)
}
const trimStartWith = (text: string, chars: string): string => {
  let start = 0
  while (start < text.length && chars.includes(text[start]!)) start += 1
  return text.slice(start)
}
const trimEndWith = (text: string, chars: string): string => {
  let end = text.length
  while (end > 0 && chars.includes(text[end - 1]!)) end -= 1
  return text.slice(0, end)
}

function splitJoin(text: string, from: string, to: string, count: number): string {
  let out = ''
  let rest = text
  let done = 0
  while (done < count) {
    const at = rest.indexOf(from)
    if (at === -1) break
    out += rest.slice(0, at) + to
    rest = rest.slice(at + from.length)
    done += 1
  }
  return out + rest
}

const listMethods: Record<string, Method> = {
  append: (self, args) => {
    ;(self as PyValue[]).push(args[0] as PyValue)
    return null
  },
  extend: (self, args, line) => {
    ;(self as PyValue[]).push(...wantIterable('extend', args[0] as PyValue, line))
    return null
  },
  insert: (self, args, line) => {
    const list = self as PyValue[]
    const at = Number(args[0] ?? 0)
    if (Number.isNaN(at)) throw new PyError('TypeError', 'insert() index must be an integer', line)
    const clamped = Math.max(0, Math.min(list.length, at < 0 ? list.length + at : at))
    list.splice(clamped, 0, args[1] as PyValue)
    return null
  },
  pop: (self, args, line) => {
    const list = self as PyValue[]
    if (list.length === 0) throw new PyError('IndexError', 'pop from empty list', line)
    const at = args.length > 0 ? Number(args[0]) : -1
    const index = at < 0 ? list.length + at : at
    if (index < 0 || index >= list.length) {
      throw new PyError('IndexError', 'pop index out of range', line)
    }
    return list.splice(index, 1)[0] as PyValue
  },
  remove: (self, args, line) => {
    const list = self as PyValue[]
    const index = list.findIndex((item) => valuesEqual(item, args[0] as PyValue))
    if (index === -1) throw new PyError('ValueError', 'list.remove(x): x not in list', line)
    list.splice(index, 1)
    return null
  },
  clear: (self) => {
    ;(self as PyValue[]).length = 0
    return null
  },
  index: (self, args, line) => {
    const list = self as PyValue[]
    const index = list.findIndex((item) => valuesEqual(item, args[0] as PyValue))
    if (index === -1) {
      throw new PyError('ValueError', `${pyRepr(args[0] as PyValue)} is not in list`, line)
    }
    return index
  },
  count: (self, args) =>
    (self as PyValue[]).filter((item) => valuesEqual(item, args[0] as PyValue)).length,
      sort: (self, args, line, kw) => {
        const list = self as PyValue[]
        if ('key' in kw) {
          throw new PyError(
            'NotImplementedError',
            "sort(key=...) needs functions, which arrive in Module 3",
            line,
          )
        }
        const reverse = truthy(kwArg(kw, args, 'reverse', 0) ?? false)
        list.sort((a, b) => compareValues(a, b, line))
        if (reverse) list.reverse()
        return null
      },
  reverse: (self) => {
    ;(self as PyValue[]).reverse()
    return null
  },
  copy: (self) => [...(self as PyValue[])],
}

const dictMethods: Record<
  string,
  (self: PyDict, args: PyValue[], line: number, kw: Kwargs) => PyValue
> = {
  keys: (self) => [...self.values()].map((entry) => entry.key) as PyValue,
  values: (self) => [...self.values()].map((entry) => entry.value) as PyValue,
  items: (self) => [...self.values()].map((entry) => [entry.key, entry.value] as PyValue) as PyValue,
  get: (self, args, line) => lookupKey(self, args[0] as PyValue, line) ?? (args[1] ?? null),
  pop: (self, args, line) => {
    const existing = lookupKey(self, args[0] as PyValue, line)
    if (existing === undefined) {
      if (args.length > 1) return args[1] as PyValue
      throw new PyError('KeyError', pyRepr(args[0] as PyValue), line)
    }
    deleteKey(self, args[0] as PyValue, line)
    return existing
  },
  setdefault: (self, args, line) => {
    const existing = lookupKey(self, args[0] as PyValue, line)
    if (existing !== undefined) return existing
    const fallback = (args[1] ?? null) as PyValue
    setKey(self, args[0] as PyValue, fallback, line)
    return fallback
  },
  update: (self, args, line) => {
    const other = args[0] as PyValue
    if (isDict(other)) {
      for (const entry of other.values()) setKey(self, entry.key, entry.value, line)
    } else {
      for (const pair of wantIterable('update', other, line)) {
        if (!isList(pair) || pair.length !== 2) {
          throw new PyError(
            'ValueError',
            `dictionary update sequence element has length ${isList(pair) ? pair.length : 1}`,
            line,
          )
        }
        setKey(self, pair[0] as PyValue, pair[1] as PyValue, line)
      }
    }
    return null
  },
  clear: (self) => {
    self.clear()
    return null
  },
  copy: (self) => new Map(self) as PyDict,
}

/** Dispatch `receiver.name(args...)`. */
export function callMethod(
  receiver: PyValue,
  name: string,
  args: PyValue[],
  line: number,
  kw: Kwargs = {},
): PyValue {
  if (typeof receiver === 'string') {
    const method = strMethods[name]
    if (method) return method(receiver, args, line, kw)
    throw new PyError('AttributeError', `'str' object has no attribute '${name}'`, line)
  }

  if (Array.isArray(receiver)) {
    const method = listMethods[name]
    if (method) return method(receiver, args, line, kw)
    throw new PyError('AttributeError', `'list' object has no attribute '${name}'`, line)
  }

  if (isDict(receiver)) {
    const method = dictMethods[name]
    if (method) return method(receiver, args, line, kw)
    throw new PyError('AttributeError', `'dict' object has no attribute '${name}'`, line)
  }

  if (isNumber(receiver)) {
    const n = numVal(receiver)
    if (name === 'is_integer') return Number.isInteger(n)
    if (name === 'bit_length') return Math.floor(Math.log2(Math.abs(n))) + 1
    throw new PyError(
      'AttributeError',
      `'${pyTypeName(receiver)}' object has no attribute '${name}'`,
      line,
    )
  }

  throw new PyError(
    'AttributeError',
    `'${pyTypeName(receiver)}' object has no attribute '${name}'`,
    line,
  )
}

export const METHOD_NAMES: Record<string, string[]> = {
  str: Object.keys(strMethods),
  list: Object.keys(listMethods),
  dict: Object.keys(dictMethods),
}

