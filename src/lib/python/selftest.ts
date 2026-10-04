import { PythonSession } from './session'

type Case = { label: string; code: string; expect?: string[]; input?: string[]; error?: string }

export const testCases: Case[] = [
  { label: 'print text', code: 'print("Hello, World!")', expect: ['Hello, World!'] },
  { label: 'multiple args', code: 'print("a", "b", 1, 2.5, True, None)', expect: ['a b 1 2.5 True None'] },
  { label: 'sep/end', code: 'print("a", "b", sep="-", end="!")\nprint("next")', expect: ['a-b!next'] },
  { label: 'comments', code: '# just a comment\nprint(1)  # trailing', expect: ['1'] },
  { label: 'variables', code: 'fruit = "Apple"\nprint(fruit)', expect: ['Apple'] },
  { label: 'reassign', code: 'x = 1\nx = 2\nprint(x)', expect: ['2'] },
  { label: 'aug assign', code: 'score = 10\nscore += 5\nscore *= 2\nprint(score)', expect: ['30'] },
  { label: 'fstring', code: 'name = "Ada"\nage = 36\nprint(f"{name} is {age} years old")', expect: ['Ada is 36 years old'] },
  { label: 'fstring nested quotes', code: 'n = 4\nprint(f"{n * 2} and {n!r} and {len(\'hey\')}")', expect: ['8 and 4 and 3'] },
  { label: 'fstring spec', code: 'v = 3.14159\nprint(f"{v:.2f}|{5:>4}|{7:03d}")', expect: ['3.14|   5|007'] },
  { label: 'math', code: 'print(7 + 2, 7 - 2, 7 * 2, 7 / 2, 7 // 2, 7 % 2, 2 ** 10)', expect: ['9 5 14 3.5 3 1 1024'] },
  { label: 'float repr', code: 'print(1 / 3)', expect: ['0.3333333333333333'] },
  { label: 'negative mod', code: 'print(-7 % 3)', expect: ['2'] },
  { label: 'str methods', code: 's = "  hello world  "\nprint(s.strip().upper())\nprint(s.strip().title())\nprint(len(s.strip()))', expect: ['HELLO WORLD', 'Hello World', '11'] },
  { label: 'split/join', code: 'parts = "a,b,c".split(",")\nprint(parts)\nprint("-".join(parts))', expect: ["['a', 'b', 'c']", 'a-b-c'] },
  { label: 'lists', code: 'nums = [3, 1, 2]\nnums.append(4)\nnums.sort()\nprint(nums, len(nums))\nprint(nums[0], nums[-1])', expect: ['[1, 2, 3, 4] 4', '1 4'] },
  { label: 'list slice', code: 'print([1,2,3,4,5][1:4])\nprint([1,2,3,4,5][::2])\nprint("hello"[::-1])', expect: ['[2, 3, 4]', '[1, 3, 5]', 'olleh'] },
  { label: 'for + range', code: 'for i in range(1, 4):\n    print(i, i * i)', expect: ['1 1', '2 4', '3 9'] },
  { label: 'while', code: 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1', expect: ['3', '2', '1'] },
  { label: 'if/elif/else', code: 'for n in [5, 0, -3]:\n    if n > 0:\n        print("pos")\n    elif n == 0:\n        print("zero")\n    else:\n        print("neg")', expect: ['pos', 'zero', 'neg'] },
  { label: 'break/continue', code: 'for i in range(10):\n    if i % 2 == 0:\n        continue\n    if i > 5:\n        break\n    print(i)', expect: ['1', '3', '5'] },
  { label: 'logic', code: 'print(1 < 2, 2 <= 2, "a" in "cat", "z" not in "cat", 3 is 3)', expect: ['True True True True True'] },
  { label: 'bool ops', code: 'print(True and False, True or False, not True, True and 0 or "fallback")', expect: ['False True False fallback'] },
  { label: 'unpack', code: 'a, b = 1, 2\nprint(a, b)', expect: ['1 2'] },
  { label: 'swap', code: 'a = 1\nb = 2\na, b = b, a\nprint(a, b)', expect: ['2 1'] },
  { label: 'input', code: 'name = input("Your name? ")\nprint(f"Hi {name}")', input: ['Zoe'], expect: ['Your name? ', '› Zoe', 'Hi Zoe'] },
  { label: 'int conversion', code: 'age = int("30")\nprint(age + 1, type(age))', expect: ['31 <class \'int\'>'] },
  { label: 'builtins', code: 'print(abs(-3), round(2.567, 2), max([1,5,3]), min(4,2,9), sum([1,2,3]))', expect: ['3 2.57 5 2 6'] },
  { label: 'sorted/reversed', code: 'print(sorted([3,1,2]), sorted("cba"), reversed([1,2]))', expect: ["[1, 2, 3] ['a', 'b', 'c'] [2, 1]"] },
  { label: 'enumerate', code: 'for i, c in enumerate("abc"):\n    print(i, c)', expect: ['0 a', '1 b', '2 c'] },
  { label: 'comprehension', code: 'print([x * x for x in range(4)])\nprint([x for x in range(10) if x % 3 == 0])', expect: ['[0, 1, 4, 9]', '[0, 3, 6, 9]'] },
  { label: 'ternary', code: 'n = 10\nprint("big" if n > 5 else "small")', expect: ['big'] },
  { label: 'dict', code: 'd = {"a": 1}\nd["b"] = 2\nprint(d, d["a"], "a" in d)', expect: ["{'a': 1, 'b': 2} 1 True"] },
  { label: 'nested indent', code: 'for i in range(2):\n    for j in range(2):\n        if i == j:\n            print("same", i)', expect: ['same 0', 'same 1'] },
  { label: 'string repeat', code: 'print("ab" * 3, "-" * 5)', expect: ['ababab -----'] },
  { label: 'escape', code: 'print("line\\nnext", "tab\\there", \'quote\\\'s\')', expect: ['line', "next tab\there quote's"] },
  { label: 'multi-line string', code: 'print("""line1\nline2""")', expect: ['line1', 'line2'] },
  { label: 'unpack loop', code: 'for a, b in [(1,2),(3,4)]:\n    print(a+b)', expect: ['3', '7'] },
  { label: 'NameError', code: 'print(missing)', error: "NameError: name 'missing' is not defined" },
  { label: 'TypeError quotes', code: 'print("a" + 1)', error: 'TypeError: unsupported operand' },
  { label: 'SyntaxError', code: 'print("unclosed', error: 'SyntaxError' },
  { label: 'IndentationError', code: 'if True:\nprint(1)', error: 'IndentationError' },
  { label: 'ZeroDivision', code: 'print(1 / 0)', error: 'ZeroDivisionError' },
  { label: 'ZeroDivision mod', code: 'print(1 % 0)', error: 'ZeroDivisionError' },
  { label: 'Function not yet', code: 'def f():\n    pass', error: 'NotImplementedError' },
  { label: 'def body skipped', code: 'def f():\n    print("nope")\nprint("yes")', error: 'NotImplementedError' },
  { label: 'infinite loop guard', code: 'while True:\n    pass', error: 'RuntimeError' },
  { label: 'no output', code: 'x = 5', expect: [] },

  /* ---------------- second round: trickier language behaviour ---------------- */

  {
    label: 'deep nesting',
    code: 'for a in range(2):\n    for b in range(2):\n        for c in range(2):\n            print(a, b, c)',
    expect: ['0 0 0', '0 0 1', '0 1 0', '0 1 1', '1 0 0', '1 0 1', '1 1 0', '1 1 1'],
  },
  {
    label: 'nested break only exits inner',
    code: 'for a in range(3):\n    for b in range(3):\n        if b == 1:\n            break\n        print(a, b)',
    expect: ['0 0', '1 0', '2 0'],
  },
  {
    label: 'if inside loop persists',
    code: 'total = 0\nfor i in range(4):\n    if i % 2 == 0:\n        total += i\nprint(total)',
    expect: ['2'],
  },
  {
    label: 'assignment inside if visible after',
    code: 'x = 1\nif True:\n    x = 99\nprint(x)',
    expect: ['99'],
  },
  {
    label: 'for target leaks after loop',
    code: 'for i in range(3):\n    pass\nprint(i)',
    expect: ['2'],
  },
  {
    label: 'nested comprehension keeps outer scope',
    code: 'x = 5\nprint([x + n for n in range(2)])\nprint(x)',
    expect: ['[5, 6]', '5'],
  },
  {
    label: 'inline suite',
    code: 'if True: print("yes"); print("also")\nprint("end")',
    expect: ['yes', 'also', 'end'],
  },
  {
    label: 'if without else and no match',
    code: 'if False:\n    print("no")\nprint("after")',
    expect: ['after'],
  },
  { label: 'nested else if', code: 'a = 5\nb = 5\nif a > b:\n    print("gt")\nelif a == b:\n    print("eq")\nprint("done")', expect: ['eq', 'done'] },
  { label: 'line continuation', code: 'total = 1 + \\\n    2 + \\\n    3\nprint(total)', expect: ['6'] },
  { label: 'crlf-ish blank lines', code: 'a = 1\n\n\nprint(a)\n', expect: ['1'] },
  { label: 'comment inside block', code: 'if True:\n    # explain\n    print(1)  # go\nprint(2)', expect: ['1', '2'] },
  { label: 'trailing comment only', code: '# just a comment', expect: [] },
  { label: 'item assignment', code: 'nums = [1, 2, 3]\nnums[1] = 99\nnums[0] += 5\nprint(nums)', expect: ['[6, 99, 3]'] },
  { label: 'dict item assign', code: 'd = {}\nd["k"] = "v"\nprint(d, d["k"], len(d))', expect: ["{'k': 'v'} v 1"] },
  {
    // Python: unary minus binds looser than **, so this is -(2 ** 2).
    label: 'unary precedence',
    code: 'print(-2 ** 2)',
    expect: ['-4'],
  },
  {
    label: 'string immutability error',
    code: 's = "hi"\ns[0] = "H"',
    error: "TypeError: 'str' object does not support item assignment",
  },
  { label: 'index error', code: 'x = [1, 2]\nprint(x[9])', error: 'IndexError' },
  { label: 'key error', code: 'd = {"a": 1}\nprint(d["b"])', error: 'KeyError' },
  {
    label: 'attr error',
    code: 'x = 5\nprint(x.foo)',
    error: "AttributeError: 'int' object has no attribute 'foo'",
  },
  { label: 'call non function', code: 'x = 5\nx()', error: 'TypeError' },
  {
    label: 'unpack mismatch',
    code: 'a, b = [1, 2, 3]',
    error: 'ValueError: too many values to unpack',
  },
  { label: 'chained assign', code: 'a = b = 7\nprint(a, b)', expect: ['7 7'] },
  { label: 'swap via tuple', code: 'a = 1\nb = 2\na, b = b, a\nprint(a, b)', expect: ['2 1'] },
  {
    label: 'bool vs int distinct',
    code: 'print(1 == True, 0 == False)',
    expect: ['True True'],
  },
  { label: 'float division result', code: 'print(1 / 4, 4 / 2, 6 // 4, 6.0 // 4)', expect: ['0.25 2.0 1 1.0'] },
  { label: 'negative floor div', code: 'print(-7 // 2, -7 % 2, -7 / 2)', expect: ['-4 1 -3.5'] },
  { label: 'power right assoc', code: 'print(2 ** 3 ** 2)', expect: ['512'] },
  {
    label: 'string methods chain',
    code: 'print("  Hello-World  ".strip().lower().replace("-", " "))',
    expect: ['hello world'],
  },
  {
    label: 'in checks',
    code: 'print("a" in "cat", 2 in [1,2], "k" in {"k":1}, "z" not in "cat")',
    expect: ['True True True True'],
  },
  {
    label: 'and or returns operand',
    code: 'print(0 and 5, 1 or 5, 2 and 7)',
    expect: ['0 1 7'],
  },
  { label: 'not binds looser than ==', code: 'print(not True == False, not (True == False))', expect: ['True True'] },
  { label: 'comparison pair', code: 'print(1 < 2, 3 > 2 > 1, 3 > 5 > 1)', expect: ['True True False'] },
  {
    label: 'ternary chain',
    code: 'n = 5\nprint("low" if n < 3 else "mid" if n < 10 else "high")',
    expect: ['mid'],
  },
  { label: 'empty containers', code: 'print([], {}, "", len([]), len({}))', expect: ['[] {}  0 0'] },
  {
    label: 'truthiness',
    code: 'print(bool(""), bool("a"), bool([]), bool([0]), bool(0), bool(None))',
    expect: ['False True False True False False'],
  },
  {
    label: 'nested fstring',
    code: 'w = 6\nprint(f"{w:>4}|{w * 2:^6}|{w / 7:.3f}")',
    expect: ['   6|  12  |0.857'],
  },
  { label: 'fstring escape braces', code: 'print(f"{{literal}} {1 + 1}")', expect: ['{literal} 2'] },
  {
    label: 'fstring multiline',
    code: 'name = "Bo"\nprint(f"""hi\n{name}""")',
    expect: ['hi', 'Bo'],
  },
  { label: 'list sort reverse', code: 'x = [3, 1, 2]\nx.sort(reverse=True)\nprint(x)', expect: ['[3, 2, 1]'] },
  { label: 'nested list', code: 'm = [[1, 2], [3]]\nm[0].append(9)\nprint(m)', expect: ['[[1, 2, 9], [3]]'] },
  {
    label: 'break out of while',
    code: 'n = 3\nwhile n > 0:\n    n -= 1\n    if n == 1:\n        break\nprint(n)',
    expect: ['1'],
  },
  { label: 'string repeat zero', code: 'print("ab" * 0, [] * 2)', expect: [' []'] },
  { label: 'list repeat', code: 'print([0] * 3)', expect: ['[0, 0, 0]'] },
  {
    label: 'multi input',
    code: 'a = input()\nb = input()\nprint(int(a) + int(b))',
    input: ['4', '5'],
    expect: ['› 4', '› 5', '9'],
  },
  {
    label: 'loop then input',
    code: 'for i in range(2):\n    print(i)\nname = input("? ")\nprint(name)',
    input: ['Zed'],
    expect: ['0', '1', '? ', '› Zed', 'Zed'],
  },

  /* --------------------- third round: int vs float ------------------------ */

  { label: 'float literal stays float', code: 'x = 3.0\nprint(x, x + 0, x * 2)', expect: ['3.0 3.0 6.0'] },
  { label: 'int literal stays int', code: 'x = 3\nprint(x + 0, x * 2)', expect: ['3 6'] },
  { label: 'int and float mix', code: 'print(1 + 2.5, 2.0 * 2, 3 - 1.0)', expect: ['3.5 4.0 2.0'] },
  { label: 'div always float', code: 'print(4 / 2, 6 / 3, 1 / 8)', expect: ['2.0 2.0 0.125'] },
  { label: 'floordiv keeps type', code: 'print(7 // 2, 7.0 // 2, 7 // 2.0)', expect: ['3 3.0 3.0'] },
  { label: 'mod keeps type', code: 'print(7 % 2, 7.5 % 2)', expect: ['1 1.5'] },
  { label: 'pow float', code: 'print(2 ** 3, 2 ** -1, 2.0 ** 2, 2 ** 0.5)', expect: ['8 0.5 4.0 1.4142135623730951'] },
  { label: 'unary minus on float', code: 'print(-2.5, -3)', expect: ['-2.5 -3'] },
  { label: 'float equality', code: 'print(1 == 1.0, 1 is 1.0, {1: "a"}[1.0])', expect: ['True False a'] },
  { label: 'float funcs', code: 'print(float(3), int(3.9), float("2.5"), int("42"))', expect: ['3.0 3 2.5 42'] },
  { label: 'round float', code: 'print(round(3.7), round(2.5), round(3.14159, 2))', expect: ['4 2 3.14'] },
  { label: 'abs and sum keep float', code: 'print(abs(-2.5), sum([1, 2]), sum([1.5, 2]))', expect: ['2.5 3 3.5'] },
  { label: 'float format spec', code: 'print(f"{2.0:.1f}|{3:.2f}|{2.5:>6.2f}|{1000000:,}")', expect: ['2.0|3.00|  2.50|1,000,000'] },
  { label: 'avg of floats', code: 'scores = [80, 90, 70]\nprint(sum(scores) / len(scores))', expect: ['80.0'] },
  { label: 'range is ints', code: 'print([type(x) for x in range(3)])', expect: ["[<class 'int'>, <class 'int'>, <class 'int'>]"] },

  /* --------------------- third round: method keywords -------------------- */

  { label: 'sort reverse kwarg', code: 'x = [3, 1, 2]\nx.sort(reverse=True)\nprint(x)', expect: ['[3, 2, 1]'] },
  { label: 'sort positional reverse', code: 'x = [3, 1, 2]\nx.sort(True)\nprint(x)', expect: ['[3, 2, 1]'] },
  { label: 'sort default ascending', code: 'x = [3, 1, 2]\nx.sort()\nprint(x)', expect: ['[1, 2, 3]'] },
  { label: 'sorted reverse kwarg', code: 'print(sorted([1,3,2], reverse=True))', expect: ['[3, 2, 1]'] },
  { label: 'split sep kwarg', code: 'print("a-b-c".split("-"))', expect: ["['a', 'b', 'c']"] },
  { label: 'join list', code: 'print("-".join(["a", "b"]))', expect: ['a-b'] },
  { label: 'index and count', code: 'x = [1, 2, 2, 3]\nprint(x.index(2), x.count(2))', expect: ['1 2'] },
]


export function runCase(testCase: Case): { passed: boolean; got: string[] } {
  const session = new PythonSession()
  session.run(testCase.code)
  const pending = [...(testCase.input ?? [])]
  let guard = 0
  while (session.state.status === 'awaiting-input' && guard++ < 20) {
    session.submit(pending.shift() ?? '')
  }
  const got = session.state.lines.map((l) => (l.stream === 'stderr' ? `! ${l.text}` : l.text))

  if (testCase.error) {
    const kind = testCase.error.split(':')[0] ?? ''
    return { passed: got.some((line) => line.startsWith('! ') && line.includes(kind)), got }
  }

  const expected = testCase.expect ?? []
  return { passed: JSON.stringify(got) === JSON.stringify(expected), got }
}

export function runAll(): { passed: number; failed: { label: string; got: string[] }[] } {
  let passed = 0
  const failed: { label: string; got: string[] }[] = []

  for (const testCase of testCases) {
    const result = runCase(testCase)
    if (result.passed) passed++
    else failed.push({ label: testCase.label, got: result.got })
  }

  return { passed, failed }
}
