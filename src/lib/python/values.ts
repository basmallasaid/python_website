import { PyError } from './errors'

export interface DictEntry {
  key: PyValue
  value: PyValue
}

/** Dicts are keyed by a hashed string so Python's `1 == 1.0` / `1 == True`
 *  key-equivalence rules are reproduced without a linear scan. */
export type PyDict = Map<string, DictEntry>

/** Python's `int` and `float` are distinct types: `4 / 2` is `2.0`, never `2`.
 *  Plain JS numbers model `int`; this wrapper marks a value as a `float`. */
export class Float {
  readonly value: number
  constructor(value: number) {
    this.value = value
  }
}

/** The object returned by `type(x)`. It reprs like `<class 'int'>` and is not
 *  a string, so `print([type(1)])` shows `[<class 'int'>]`, not a quoted list. */
export class TypeObject {
  readonly name: string
  constructor(name: string) {
    this.name = name
  }
}

export type PyValue =
  | number
  | Float
  | TypeObject
  | string
  | boolean
  | null
  | PyValue[]
  | PyDict
export type PyKey = string | number | Float | boolean | null

export const isDict = (value: unknown): value is PyDict => value instanceof Map
export const isList = (value: unknown): value is PyValue[] => Array.isArray(value)
export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number | Float =>
  typeof value === 'number' || value instanceof Float
export const isBool = (value: unknown): value is boolean => typeof value === 'boolean'

/** True for a Python `int` (excludes `bool`, which is a subclass of `int`). */
export const isInt = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value)

/** Unwrap a numeric value to its JS number. */
export const numVal = (value: number | Float): number =>
  value instanceof Float ? value.value : value

/** Wrap a JS number as a Python `float`. */
export const float = (value: number): Float => new Float(value)

/** True when a number should be treated as a Python `int`. */
export const isInteger = (value: PyValue): boolean =>
  isInt(value) || (value instanceof Float && Number.isInteger(value.value))

export function pyTypeName(value: PyValue): string {
  if (value === null) return 'NoneType'
  if (value instanceof TypeObject) return 'type'
  if (typeof value === 'boolean') return 'bool'
  if (value instanceof Float) return 'float'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float'
  if (typeof value === 'string') return 'str'
  if (Array.isArray(value)) return 'list'
  return 'dict'
}

/** Format a float the way Python's repr does. */
export function formatFloat(n: number): string {
  if (Number.isNaN(n)) return 'nan'
  if (n === Infinity) return 'inf'
  if (n === -Infinity) return '-inf'
  if (Number.isInteger(n) && Math.abs(n) < 1e16) return `${n}.0`
  return String(n)
}

/** `str(value)` — what you get inside an f-string or `print`. */
export function pyStr(value: PyValue): string {
  if (value === null) return 'None'
  if (value instanceof TypeObject) return `<class '${value.name}'>`
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (value instanceof Float) return formatFloat(value.value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return `[${value.map(pyRepr).join(', ')}]`
  return `{${[...value.values()]
    .map((entry) => `${pyRepr(entry.key)}: ${pyRepr(entry.value)}`)
    .join(', ')}}`
}

/** `repr(value)` — the developer-facing form. */
export function pyRepr(value: PyValue): string {
  if (typeof value === 'string') return reprString(value)
  return pyStr(value)
}

export function reprString(text: string): string {
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r')
  const quote = escaped.includes("'") && !escaped.includes('"') ? '"' : "'"
  return quote + escaped.split(quote).join(`\\${quote}`) + quote
}

/** Python truthiness. */
export function truthy(value: PyValue): boolean {
  if (value === null) return false
  if (value instanceof TypeObject) return true
  if (typeof value === 'boolean') return value
  if (value instanceof Float) return value.value !== 0
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return value.length > 0
  if (Array.isArray(value)) return value.length > 0
  return value.size > 0
}

/** Normalise a value into a hashable key, or throw Python's unhashable error. */
export function toKey(value: PyValue, line: number | null): PyKey {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value
  if (value instanceof Float) return value.value === Math.trunc(value.value) ? value.value : value
  if (typeof value === 'number') return value
  throw new PyError('TypeError', `unhashable type: '${pyTypeName(value)}'`, line)
}

/** `1`, `1.0` and `True` all hash alike, exactly as CPython does. */
export function hashKey(key: PyKey): string {
  if (typeof key === 'boolean') return `b:${key ? '1' : '0'}`
  if (key === null) return 'n:'
  if (key instanceof Float) return Number.isInteger(key.value) ? `i:${key.value}` : `f:${key.value}`
  if (typeof key === 'number') return Number.isInteger(key) ? `i:${key}` : `f:${key}`
  return `s:${key}`
}

export function lookupKey(dict: PyDict, key: PyValue, line: number | null): PyValue | undefined {
  return dict.get(hashKey(toKey(key, line)))?.value
}

export function setKey(dict: PyDict, key: PyValue, value: PyValue, line: number | null): void {
  const pyKey = toKey(key, line)
  dict.set(hashKey(pyKey), { key: pyKey, value })
}

export function deleteKey(dict: PyDict, key: PyValue, line: number | null): boolean {
  return dict.delete(hashKey(toKey(key, line)))
}

/** Values that can appear in a container. */
export function iterate(value: PyValue, line: number): PyValue[] {
  if (typeof value === 'string') return Array.from(value)
  if (Array.isArray(value)) return value
  if (value instanceof Map) return [...value.values()].map((entry) => entry.key)
  throw new PyError('TypeError', `'${pyTypeName(value)}' object is not iterable`, line)
}

export function lengthOf(value: PyValue, line: number): number {
  if (typeof value === 'string') return Array.from(value).length
  if (Array.isArray(value)) return value.length
  if (value instanceof Map) return value.size
  throw new PyError('TypeError', `object of type '${pyTypeName(value)}' has no len()`, line)
}

/** Python `==` semantics. `bool` is a subclass of `int`, so `1 == True`. */
export function valuesEqual(a: PyValue, b: PyValue): boolean {
  if (a === null || b === null) return a === b
  const aNum = numericOf(a)
  const bNum = numericOf(b)
  if (aNum !== null && bNum !== null) return aNum === bNum
  if (typeof a === 'string' && typeof b === 'string') return a === b
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => valuesEqual(item, b[i] as PyValue))
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [hash, entry] of a) {
      const other = b.get(hash)
      if (!other || !valuesEqual(entry.value, other.value)) return false
    }
    return true
  }
  return a === b
}

/** Numeric view of a value; `bool` counts as 0/1 because `bool` subclasses `int`. */
function numericOf(value: PyValue): number | null {
  if (typeof value === 'boolean') return value ? 1 : 0
  if (value instanceof Float) return value.value
  if (typeof value === 'number') return value
  return null
}

/** Ordering used by `<`, `sorted`, `max`, `min`. */
export function compareValues(a: PyValue, b: PyValue, line: number | null): number {
  if (isNumber(a) && isNumber(b)) {
    const x = numVal(a)
    const y = numVal(b)
    return x === y ? 0 : x < y ? -1 : 1
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b ? 0 : a < b ? -1 : 1
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.min(a.length, b.length)
    for (let i = 0; i < len; i++) {
      const result = compareValues(a[i] as PyValue, b[i] as PyValue, line)
      if (result !== 0) return result
    }
    return a.length === b.length ? 0 : a.length < b.length ? -1 : 1
  }
  if (a instanceof Map && b instanceof Map) {
    const left = [...a.values()].map((entry) => pyRepr(entry.key))
    const right = [...b.values()].map((entry) => pyRepr(entry.key))
    return compareValues(left, right, line)
  }
  throw new PyError(
    'TypeError',
    `'<' not supported between instances of '${pyTypeName(a)}' and '${pyTypeName(b)}'`,
    line,
  )
}

/** Insert `,` thousands separators into the integer part of a formatted number. */
function addThousands(body: string): string {
  const match = /^(-?)(\d+)(\D*)$/.exec(body)
  if (!match) return body
  const [, sign, digits, tail] = match
  return sign + (digits as string).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (tail ?? '')
}

/** Apply a format spec such as `>10`, `.2f`, `,`, `05d`. */export function applyFormatSpec(value: PyValue, spec: string, line: number): string {
  if (!spec) return pyStr(value)

  const match =
    /^(?:(?<fill>[^{}])?(?=[<>^=]))?(?<align>[<>^=])?(?:\+(?![<>^=]))?[ ]?(?:#)?(?<zero>0?)(?<width>\d*)(?<comma>,?)(?:\.(?<precision>\d+))?(?<type>[bcdeEfFgGnosxX%])?$/.exec(
      spec,
    )

  if (!match?.groups) {
    if (typeof value === 'string' || isNumber(value)) return pyStr(value)
    throw new PyError('ValueError', `invalid format specifier '${spec}'`, line)
  }

  const {
    fill: rawFill,
    align: rawAlign,
    zero,
    width = '',
    comma,
    precision,
    type,
  } = match.groups
  const fill = rawFill ?? (zero ? '0' : ' ')
  const align = rawAlign ?? (zero ? '>' : undefined)

  let body: string
  const numeric = isNumber(value) ? numVal(value) : null

  if (numeric !== null) {
    switch (type) {
      case 'f':
      case 'F':
        body = numeric.toFixed(precision ? Number(precision) : 6)
        break
      case 'e':
      case 'E':
        body = numeric.toExponential(precision ? Number(precision) : 6)
        break
      case 'd':
        body = String(Math.trunc(numeric))
        break
      case 'b':
        body = (Math.trunc(numeric) >>> 0).toString(2)
        break
      case 'x':
        body = (Math.trunc(numeric) >>> 0).toString(16)
        break
      case 'X':
        body = (Math.trunc(numeric) >>> 0).toString(16).toUpperCase()
        break
      case 'o':
        body = (Math.trunc(numeric) >>> 0).toString(8)
        break
      case '%':
        body = `${(numeric * 100).toFixed(precision ? Number(precision) : 6)}%`
        break
      case 'g':
      case 'G':
        body = String(Number(numeric.toPrecision(precision ? Number(precision) : 6)))
        break
      default:
        body = Number.isInteger(numeric) ? String(numeric) : formatFloat(numeric)
        if (precision) body = numeric.toFixed(Number(precision))
        break
    }
    if (type === 'E') body = body.toUpperCase()
    if (comma && type !== 'b' && type !== 'x' && type !== 'X' && type !== 'o') {
      body = addThousands(body)
    }
  } else if (typeof value === 'string') {
    body = precision ? value.slice(0, Number(precision)) : value
  } else {
    body = pyStr(value)
  }

  const widthNum = Number(width || 0)
  if (body.length >= widthNum) return body
  const padTotal = widthNum - body.length
  const pad = fill.repeat(padTotal)
  switch (align) {
    case '<':
      return body + pad
    case '^': {
      const left = Math.floor(padTotal / 2)
      return fill.repeat(left) + body + fill.repeat(padTotal - left)
    }
    case '>':
    default:
      return pad + body
  }
}
