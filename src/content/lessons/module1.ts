import type { Lesson, Module } from './types'

export const module1: Module = {
  id: 'module-1',
  number: 1,
  title: 'Python Foundations',
  description:
    'Learn to talk to your computer. Print text, store values, make decisions, and repeat work with loops.',
  lessons: [
    {
      slug: 'hello-python',
      order: 1,
      title: 'Hello, Python',
      subtitle: 'Your first program and how print() works',
      minutes: 6,
      icon: 'printer',
      xp: 50,
      objectives: [
        'Understand what a program is: instructions your computer follows in order',
        'Call the built-in print() function and put text inside quotes',
        'Predict what a line of code will print before you run it',
      ],
      sections: [
        {
          heading: 'A program is a list of instructions',
          body: `Every program you will ever write is just a **list of instructions**, and your computer follows them strictly from top to bottom. Python reads a line, does what it says, then moves to the next one.

Your very first program is one instruction long. The word \`print()\` is a **function**: a ready-made tool that Python ships with. The parentheses tell Python *what to give the tool*, and anything inside quotes is **text** — a string.`,
          code: 'print("Hello, world!")',
          list: [
            '`print` — the name of the tool',
            '(`"Hello, world!"`)` — the thing you hand it',
            'No `;` and no curly braces. Python uses indentation instead.',
          ],
        },
        {
          heading: 'Quotes matter',
          body: `Text has to sit inside quotes, otherwise Python thinks it is the name of something. Leave the quotes off and you get a \`NameError\` — Python's way of saying *I have never heard of that word*.

You can use either \`"double quotes"\` or \`'single quotes'\`. Pick one style and stay consistent; mixing them for no reason is just noise.`,
          code: 'print("It\'s working")\nprint(\'She said "hello"\')',
          callout: {
            tone: 'tip',
            title: 'Predict first',
            body: 'Before you hit Run, read the code and say the answer out loud. Getting it right builds intuition; getting it wrong teaches you something faster.',
          },
        },
        {
          heading: 'One print, many values',
          body: `You can hand \`print()\` several values at once. By default it puts a single space between them and moves to a new line at the end.`,
          code: 'print("Python", "is", "fun")\nprint(2026, 3.14, True)',
          list: [
            'Numbers do **not** need quotes — `2026` is a number, `"2026"` is text.',
            '`True` and `False` start with a capital letter in Python.',
          ],
        },
        {
          heading: 'Controlling the gap and the ending',
          body: `Two optional keywords let you fine-tune the output. \`sep\` sets what goes **between** values, and \`end\` sets what comes **after** the last one.`,
          code: 'print("2026", "07", "04", sep="-")\nprint("Loading", end="...")\nprint(" done")',
          callout: {
            tone: 'note',
            title: 'Keywords',
            body: 'A keyword argument is written `name=value`. It lets you skip a parameter you do not care about.',
          },
        },
      ],
      playground: {
        caption: 'Change the text and add a second print. What shows up?',
        starter: 'print("Hello, world!")\n',
      },
      challenge: {
        prompt: 'Introduce yourself to the terminal.',
        requirements: [
          'Print the line `My name is Ada`',
          'Print a second line saying `I am learning Python`',
          'Use `sep` so the first line reads `Python is fun` from three separate words',
        ],
        starter: '# Print three words with a space between them\n\n',
        solution: 'print("My name is Ada")\nprint("I am learning Python")\nprint("Python", "is", "fun", sep=" ")\n',
        checks: [
          { label: 'Prints your name line', expect: ['My name is Ada'] },
          { label: 'Prints the learning line', expect: ['I am learning Python'] },
          { label: 'Joins three words with spaces', expect: ['Python is fun'] },
          { label: 'Runs without errors', expect: ['My name is Ada', 'I am learning Python', 'Python is fun'], forbidError: true },
        ],
        hints: [
          '`print("Python", "is", "fun")` already puts spaces between the words — try it before reaching for `sep`.',
          'Each `print()` call ends with a newline of its own, so you need three separate calls.',
        ],
      },
      quiz: [
        {
          prompt: 'What does `print("4" + 5)` display?',
          options: ['9', '45', 'A TypeError', '4 5'],
          answer: 2,
          explanation:
            'Both values are text, and you cannot add text to a number. Python raises TypeError and reminds you that quotes make something a string.',
        },
        {
          prompt: 'Which line prints exactly `Hello` with no trailing space?',
          options: [
            'print("Hello ")',
            'print("Hello", end="")',
            'print(end="Hello")',
            'print("Hello", sep="")',
          ],
          answer: 1,
          explanation:
            '`end` controls what comes after the last value. Setting it to an empty string removes the newline.',
        },
        {
          prompt: 'Why do strings need quotes?',
          options: [
            'To make them easier to read',
            'So Python can tell text apart from variable names',
            'Because Python requires them for every value',
            'To mark the end of a line',
          ],
          answer: 1,
          explanation:
            'Without quotes, `print(hello)` asks Python for a variable called `hello`, which produces a NameError unless it exists.',
        },
      ],
    },

    {
      slug: 'variables',
      order: 2,
      title: 'Variables & Values',
      subtitle: 'Store a value and give it a name',
      minutes: 9,
      icon: 'box',
      xp: 60,
      objectives: [
        'Create a variable with `=` and read it back',
        'Reassign a variable and understand that names point at values',
        'Update a value in place with augmented assignment',
      ],
      sections: [
        {
          heading: 'A name for a value',
          body: `A **variable** is a name that points at a value. You create one with \`=\`, called the **assignment operator**.

\`\`\`\`python
fruit = "Apple"
\`\`\`\`

Read that as: *point the name \`fruit\` at the text \`"Apple"\`*. Python does not copy the text; it just remembers where the text lives.`,
          code: 'fruit = "Apple"\ncolor = "red"\n\nprint(fruit)\nprint(color)',
          callout: {
            tone: 'note',
            title: 'Valid names',
            body: 'Letters, digits and underscores, never starting with a digit. `fruit`, `my_var` and `_total` are fine; `2fruit` and `my-var` are not.',
          },
        },
        {
          heading: 'The box analogy',
          body: `Think of a variable as a labelled box. The **label** is the name, and the box holds a value.

When you write \`fruit = "Apple"\`, you drop the text \`"Apple"\` into the box labelled \`fruit\`. Later, using the name \`fruit\` means "go and fetch whatever is in that box right now".

This matters because a name can be **reassigned**.`,
          code: 'fruit = "Apple"\nprint(fruit)\n\nfruit = "Banana"\nprint(fruit)',
          list: [
            'The box labelled `fruit` now holds `"Banana"`.',
            'The old text still exists in memory — nothing was destroyed, we just repointed the label.',
          ],
        },
        {
          heading: 'Updating without rewriting',
          body: `Augmented assignment combines a calculation and an assignment in one step. It reads as *"take what is in the box, apply this, put the answer back"*.`,
          code: 'score = 10\nscore += 5    # score = score + 5\nscore *= 2    # score = score * 2\n\nprint(score)   # 30',
          list: ['`+=` add', '`-=` subtract', '`*=` multiply', '`/=` divide'],
        },
        {
          heading: 'Naming things well',
          body: `Python does not enforce naming rules, but future-you will be grateful. Prefer names that describe the value: \`total_price\` beats \`tp\`, and \`user_age\` beats \`a\`.

Use \`snake_case\` — lowercase words joined with underscores. That is the convention in Python, and linters expect it.`,
          code: 'total_price = 24.99\nquantity = 3\n\nprint(total_price * quantity)',
          callout: {
            tone: 'tip',
            title: 'Ask the question test',
            body: 'Read `total_price = 24.99` out loud. If it says something sensible, the name is probably good.',
          },
        },
      ],
      playground: {
        caption: 'Change the value and watch the box update.',
        starter: 'fruit = "Apple"\n\nprint(fruit)\n\nfruit = "Banana"\nprint(fruit)\n',
      },
      challenge: {
        prompt: 'Track a score through a few updates.',
        requirements: [
          'Start `score` at `10`',
          'Add `5`, then double the result with `*=`',
          'Print `Score: 30` on one line',
          'Create `label = "final"` and print `label: 30`',
        ],
        starter: 'score = 10\n\n',
        solution:
          'score = 10\nscore += 5\nscore *= 2\nlabel = "final"\n\nprint("Score:", score)\nprint(label + ":", score)\n',
        checks: [
          { label: 'Prints the score line', expect: ['Score: 30'] },
          { label: 'Prints the label line', expect: ['final: 30'] },
          { label: 'Uses no errors', expect: ['Score: 30', 'final: 30'], forbidError: true },
        ],
        hints: [
          '`print("Score:", score)` gives you the space between the two for free.',
          'Order matters: `+= 5` first, then `*= 2`. Reversed, you would get 22.',
        ],
      },
      quiz: [
        {
          prompt: 'After `x = 5` then `x = x + 3`, what is `x`?',
          options: ['5', '8', '3', 'An error'],
          answer: 1,
          explanation:
            'The right side is evaluated first (5 + 3 = 8), then the name `x` is repointed at 8.',
        },
        {
          prompt: 'What does `x += 2` do?',
          options: [
            'Adds 2 to x',
            'Creates a new variable called x2',
            'Multiplies x by 2',
            'Prints x + 2',
          ],
          answer: 0,
          explanation: 'Augmented assignment adds 2 to the current value of x and stores the result back in x.',
        },
        {
          prompt: 'Which is a valid Python variable name?',
          options: ['2cool', 'my-var', 'my_var', 'my var'],
          answer: 2,
          explanation:
            'Names can contain letters, digits and underscores, but cannot start with a digit or contain spaces or dashes.',
        },
      ],
    },

    {
      slug: 'strings',
      order: 3,
      title: 'Strings & Text',
      subtitle: 'Quotes, methods, and f-strings',
      minutes: 10,
      icon: 'quote',
      xp: 60,
      objectives: [
        'Tell text apart from numbers using quotes',
        'Join text with `+` and repeat it with `*`',
        'Call string methods such as `.upper()` and `.strip()`',
        'Build strings with f-strings instead of manual concatenation',
      ],
      sections: [
        {
          heading: 'Text is a string',
          body: `Any value wrapped in quotes is a **string** — Python's name for text. The quotes are not part of the text; they are the signal that says *this is a word, not a name*.

Strings are immutable, meaning they never change. Every "editing" method actually returns a brand-new string.`,
          code: 'language = "Python"\n\nprint(language)\nprint(len(language))   # 6 characters',
        },
        {
          heading: 'Joining and repeating',
          body: `The \`+\` operator does double duty. With two strings it concatenates; with a string and a number it repeats.`,
          code: 'print("Hello, " + "world")   # Hello, world\nprint("ha" * 3)             # hahaha\n\nname = "Ada"\nprint("Hi " + name + "!")  # Hi Ada!',
          callout: {
            tone: 'warn',
            title: 'Mixing types fails',
            body: '`"Score: " + 30` raises TypeError. Either convert with `str(30)` or, better, use an f-string.',
          },
        },
        {
          heading: 'String methods',
          body: `A **method** is a function that belongs to a value. You reach it with a dot.

Methods never change the original string. They return a new one, so you must either use the result or store it back.`,
          code: 'name = "  ada lovelace  "\n\nprint(name.strip())        # trims the spaces\nprint(name.upper())        # ADA LOVELACE\nprint(name.title())        # Ada Lovelace\nprint(name.replace("a", "@"))',
          list: [
            '`.strip()` removes leading and trailing whitespace',
            '`.upper()` / `.lower()` change case',
            '`.replace(a, b)` swaps one substring for another',
            '`.split(sep)` cuts a string into a list of pieces',
          ],
        },
        {
          heading: 'Cutting and measuring text',
          body: `A couple more methods come up constantly when you start working with real input.`,
          code: 'print("a,b,c".split(","))   # [\'a\', \'b\', \'c\']\nprint("hello".count("l"))    # 2\nprint("  hi  ".strip())        # \'hi\'',
        },
        {
          heading: 'f-strings: the tool you will actually use',
          body: `An f-string lets you drop variables straight into text. Put an \`f\` in front of the quotes and wrap anything you want evaluated in \`{ }\`.`,
          code: 'name = "Ada"\nage = 36\n\nprint(f"{name} is {age} years old")\n# Ada is 36 years old',
        },
        {
          heading: 'Formatting numbers',
          body: `After a colon inside an f-string you can add a **format spec** — instructions for how the value should look.`,
          code: 'price = 24.5\nscore = 0.8567\n\nprint(f"{price:.2f}")     # 24.50   (two decimals)\nprint(f"{score:.1%}")    # 85.7%   (as a percentage)\nprint(f"{1234567:,}")    # 1,234,567\nprint(f"{42:>6}")        # "    42" (right-aligned in 6)',
          callout: {
            tone: 'tip',
            title: 'Reach for f-strings first',
            body: 'They are faster to read, harder to get wrong, and they avoid the TypeError trap entirely.',
          },
        },
      ],
      playground: {
        caption: 'Try a format spec on your own name.',
        starter: 'name = "Ada"\nscore = 0.8567\n\nprint(f"{name} scored {score:.1%}")\n',
      },
      challenge: {
        prompt: 'Build a formatted receipt line.',
        requirements: [
          'Set `item = "Coffee"` and `price = 4.5`',
          'Print `Coffee costs $4.50` using an f-string with `:.2f`',
          'Print `Shout: COFFEE` using `.upper()`',
          'Print the character count of `item` with `len()`',
        ],
        starter: 'item = "Coffee"\nprice = 4.5\n\n',
        solution:
          'item = "Coffee"\nprice = 4.5\n\nprint(f"{item} costs ${price:.2f}")\nprint("Shout:", item.upper())\nprint(len(item))\n',
        checks: [
          { label: 'Formatted price line', expect: ['Coffee costs $4.50'] },
          { label: 'Uppercase line', expect: ['Shout: COFFEE'] },
          { label: 'Character count', expect: ['6'] },
          { label: 'Runs without errors', expect: ['Coffee costs $4.50', 'Shout: COFFEE', '6'], forbidError: true },
        ],
        hints: [
          '`f"${price:.2f}"` gives you `$4.50` — the dollar sign is just literal text.',
          '`len("Coffee")` is 6 because it counts letters, not the quotes.',
        ],
      },
      quiz: [
        {
          prompt: 'What does `print("ab" * 3)` display?',
          options: ['ababab', 'ab3', '"ab" * 3', 'An error'],
          answer: 0,
          explanation: 'Multiplying a string by an integer repeats it that many times.',
        },
        {
          prompt: 'Which is the correct way to show a number inside text?',
          options: [
            'print("You have " + 5 + " apples")',
            'print("You have", 5, "apples")',
            'print(f"You have {5} apples")',
            'print("You have {5} apples")',
          ],
          answer: 2,
          explanation:
            'Inside an f-string, `{5}` is evaluated and replaced with its value. Without the `f` prefix the braces stay as literal text.',
        },
        {
          prompt: 'What does `f"{3.14159:.2f}"` produce?',
          options: ['3.14', '3.14159', '3', '3.2'],
          answer: 0,
          explanation: '`:.2f` formats the number as a float with exactly two decimal places.',
        },
      ],
    },

    {
      slug: 'numbers',
      order: 4,
      title: 'Numbers & Math',
      subtitle: 'Integers, floats, and the operators you need',
      minutes: 11,
      icon: 'calculator',
      xp: 70,
      objectives: [
        'Tell integers and floats apart',
        'Use the arithmetic operators including `//`, `%` and `**`',
        'Convert between types with `int()`, `float()` and `round()`',
        'Read and fix a division-by-zero error',
      ],
      sections: [
        {
          heading: 'Two kinds of number',
          body: `Python has two everyday number types.

An **int** is a whole number: \`0\`, \`42\`, \`-7\`. A **float** is a number with a decimal point: \`3.14\`, \`0.5\`, \`-2.0\`.

You can tell them apart at runtime with \`type()\`, and you should know that Python keeps them distinct — \`4 / 2\` gives you \`2.0\`, not \`2\`.`,
          code: 'print(type(42))     # <class \'int\'>\nprint(type(42.0))   # <class \'float\'>\nprint(4 / 2)        # 2.0\nprint(4 // 2)       # 2',
        },
        {
          heading: 'The operators',
          body: `\`+\` and \`-\` behave as you expect. The interesting ones are the division family and the power operator.`,
          code: 'print(7 + 2)    # 9\nprint(7 - 2)    # 5\nprint(7 * 2)    # 14\nprint(7 / 2)    # 3.5   true division, always a float\nprint(7 // 2)   # 3     floor division, drops the remainder\nprint(7 % 2)    # 1     remainder\nprint(7 ** 2)   # 49    power',
          list: [
            '`//` is called **floor** division: it rounds down toward negative infinity.',
            '`%` gives the remainder — perfect for "every third day" or odd/even checks.',
            '`**` is exponentiation, and it binds tighter than anything else.',
          ],
          callout: {
            tone: 'tip',
            title: 'Modulo is your friend',
            body: '`n % 2 == 0` means "n is even". `n % 7 == 0` means "n is a multiple of seven".',
          },
        },
        {
          heading: 'Order of operations',
          body: `Python follows the same precedence rules you would expect from maths, with one extra rule: **exponentiation binds tighter than unary minus**.

Parentheses always win. Reach for them whenever the default reading is not obvious.`,
          code: 'print(2 + 3 * 4)     # 14\nprint((2 + 3) * 4)   # 20\nprint(-2 ** 2)        # -4, because it is -(2 ** 2)\nprint(2 ** 3 ** 2)    # 512, right to left',
        },
        {
          heading: 'Converting between types',
          body: `Values arrive from \`input()\` as text, so converting is a daily task. \`int()\` and \`float()\` parse a string into a number; \`round()\` tidies one up.`,
          code: 'print(int("42") + 1)     # 43\nprint(float("3.5") * 2)  # 7.0\nprint(round(3.14159, 2)) # 3.14\nprint(round(2.5))       # 2  (Python rounds halves to even)',
          callout: {
            tone: 'warn',
            title: 'Division by zero',
            body: 'Dividing by zero raises `ZeroDivisionError`. Python will not quietly give you infinity — it stops and tells you.',
          },
        },
      ],
      playground: {
        caption: 'Predict each result, then run to check.',
        starter: 'print(9 / 2)\nprint(9 // 2)\nprint(9 % 2)\nprint(9 ** 2)\n',
      },
      challenge: {
        prompt: 'Work out a shopping total.',
        requirements: [
          'Set `price = 19.99` and `quantity = 3`',
          'Print the raw total using `*`',
          'Print the total rounded to 2 decimals using `round()`',
          'Print `Discount: 10.0` by taking 10% of the rounded total',
        ],
        starter: 'price = 19.99\nquantity = 3\n\n',
        solution:
          'price = 19.99\nquantity = 3\n\ntotal = price * quantity\nrounded = round(total, 2)\n\nprint(rounded)\nprint(f"Discount: {rounded * 0.1:.1f}")\n',
        checks: [
          { label: 'Rounded total', expect: ['59.97'] },
          { label: 'Ten percent discount', expect: ['Discount: 6.0'] },
          { label: 'Runs without errors', expect: ['59.97', 'Discount: 6.0'], forbidError: true },
        ],
        hints: [
          '`19.99 * 3` gives `59.97000000000001` in floating point — that is exactly why you round.',
          'Ten percent is `total * 0.10`. Use `:.1f` in the f-string to keep it to one decimal.',
        ],
      },
      quiz: [
        {
          prompt: 'What does `7 / 2` return in Python 3?',
          options: ['3', '3.5', '4', '3.0'],
          answer: 1,
          explanation:
            'The single slash is true division and always produces a float. Use `7 // 2` if you want the floored integer 3.',
        },
        {
          prompt: 'What does `17 % 5` give you?',
          options: ['2', '3', '3.4', '85'],
          answer: 0,
          explanation:
            'The modulo operator returns the remainder: 17 = 3 × 5 + 2, so the leftover is 2.',
        },
        {
          prompt: 'Which expression always evaluates to a float?',
          options: ['7 // 2', '7 - 2', '7 / 2', '7 * 2'],
          answer: 2,
          explanation:
            'Only `/` forces float results. `//` returns an int when both operands are ints.',
        },
      ],
    },

    {
      slug: 'input',
      order: 5,
      title: 'User Input',
      subtitle: 'Ask a question, read the answer',
      minutes: 10,
      icon: 'keyboard',
      xp: 70,
      objectives: [
        'Call `input()` and capture the answer in a variable',
        'Explain why input always returns a string',
        'Convert input to a number before doing maths with it',
        'Write a prompt that reads clearly',
      ],
      sections: [
        {
          heading: 'Asking the question',
          body: `\`input()\` pauses the program, prints your prompt, and waits for the user to type a line and press Enter. Whatever they typed comes back as the return value.

To keep the value, put the call on the right side of an \`=\`.`,
          code: 'name = input("What is your name? ")\nprint(f"Hello, {name}!")',
          callout: {
            tone: 'tip',
            title: 'Space at the end',
            body: 'Include a trailing space in your prompt string — `"Name: "` — otherwise the cursor butts up against your colon.',
          },
        },
        {
          heading: 'The string trap',
          body: `This is the single most common beginner bug, so it is worth understanding properly.

**\`input()\` always returns a string.** Even if the user types \`42\`, you receive the three characters \`"4"\`, \`"2"\`, \`"\`.`,
          code: 'age = input("Age: ")\nprint(type(age))   # <class \'str\'>\n\nprint(age + 1)     # TypeError! You cannot add int to str',
        },
        {
          heading: 'Convert before you calculate',
          body: `Wrap the call in \`int()\` or \`float()\` to convert as you read. Nesting the calls keeps it to one line.`,
          code: 'age = int(input("Age: "))\nprint(age + 1)     # works now\n\nprice = float(input("Price: "))\nprint(price * 1.2) # adds 20% tax',
          list: [
            '`int("42")` → `42`',
            '`float("3.5")` → `3.5`',
            '`int("hello")` → `ValueError`, because it is not a number',
          ],
        },
        {
          heading: 'Asking twice',
          body: `Each \`input()\` call waits for its own answer, in the order you write them. Store them separately, then convert once you have everything.`,
          code: 'first = input("First name: ")\nlast = input("Last name: ")\n\nfull = f"{first} {last}"\nprint(f"Welcome, {full}!")',
          callout: {
            tone: 'note',
            title: 'Try it here',
            body: 'The console below accepts real input. Run the program and answer the prompts to see the flow.',
          },
        },
      ],
      playground: {
        caption: 'Run it, then answer the prompt in the console.',
        starter: 'name = input("What is your name? ")\nprint(f"Hello, {name}!")\n',
      },
      challenge: {
        prompt: 'Build a small order calculator.',
        requirements: [
          'Ask for a coffee count and store it as an `int`',
          'Ask for the price of one coffee and store it as a `float`',
          'Print `Total: 7.50` for an input of 2 coffees at 3.75',
        ],
        starter: 'count = int(input("How many coffees? "))\nprice = float(input("Price each? "))\n\n',
        solution:
          'count = int(input("How many coffees? "))\nprice = float(input("Price each? "))\n\ntotal = count * price\nprint(f"Total: {total:.2f}")\n',
        checks: [
          { label: 'Shows both prompts', expect: ['How many coffees? ', 'Price each? '] },
          { label: 'Shows the entered lines', expect: ['› 2', '› 3.75'] },
          { label: 'Prints the total', expect: ['Total: 7.50'] },
        ],
        hints: [
          'Test with 2 and 3.75 — the console lets you type real answers.',
          '`f"{total:.2f}"` forces exactly two decimal places, whatever the input.',
        ],
      },
      quiz: [
        {
          prompt: 'What type does `input()` return?',
          options: ['int', 'float', 'str', 'Whatever the user typed'],
          answer: 2,
          explanation:
            'Always a string, because the user could type anything. Convert with int() or float() when you need a number.',
        },
        {
          prompt: 'What does `x = int(input("x: "))` do?',
          options: [
            'Prints a prompt and stores a number',
            'Prints a prompt and stores the text the user typed',
            'Asks twice',
            'Raises an error',
          ],
          answer: 0,
          explanation:
            'input() returns a string, and int() converts it straight away, so x holds a number.',
        },
        {
          prompt: 'Why does `age = input("Age: ") + "1"` behave unexpectedly?',
          options: [
            'It is a syntax error',
            'It concatenates the text instead of adding one',
            'It adds 1 correctly',
            'It prints nothing',
          ],
          answer: 1,
          explanation:
            'Both operands are strings, so `+` glues them together. Convert with int() before doing arithmetic.',
        },
      ],
    },

    {
      slug: 'conditionals',
      order: 6,
      title: 'Making Decisions',
      subtitle: 'if, elif, else and indentation',
      minutes: 12,
      icon: 'split',
      xp: 80,
      objectives: [
        'Run a block of code only when a condition is true',
        'Chain checks with `elif` and provide a fallback with `else`',
        'Combine conditions with `and`, `or`, `not`',
        'Use indentation to define a block',
      ],
      sections: [
        {
          heading: 'The basic shape',
          body: `A conditional runs code **only when a condition is true**. The condition is any expression that produces \`True\` or \`False\`.

The colon at the end of the line opens a block, and the indented lines below it belong to it.`,
          code: 'age = 20\n\nif age >= 18:\n    print("You can vote")\n    print("Welcome aboard")',
          callout: {
            tone: 'warn',
            title: 'Indentation is syntax',
            body: 'Python uses indentation to decide what belongs to the `if`. Forgetting it raises IndentationError — this is not a style choice, it is the language.',
          },
        },
        {
          heading: 'Everyday comparisons',
          body: `You already know \`=\` means assignment. Equality is \`==\`, and inequality is \`!=\`. Mixing them up is the classic first bug.`,
          code: 'score = 75\n\nprint(score == 75)   # True\nprint(score != 75)   # False\nprint(score > 50)    # True\nprint(score >= 75)   # True',
          list: [
            '`==` equal, `!=` not equal',
            '`>` greater than, `>=` greater or equal',
            '`<` less than, `<=` less or equal',
          ],
        },
        {
          heading: 'Two-way and three-way branches',
          body: `\`else\` covers everything the \`if\` missed. When you have more than two cases, chain \`elif\` branches and Python checks them top to bottom, stopping at the first match.`,
          code: 'grade = 85\n\nif grade >= 90:\n    print("A")\nelif grade >= 80:\n    print("B")\nelif grade >= 70:\n    print("C")\nelse:\n    print("F")',
          callout: {
            tone: 'tip',
            title: 'Order from strictest to loosest',
            body: 'Put the most specific test first. If you check `grade > 0` before `grade >= 90`, everything above 0 will match the first branch.',
          },
        },
        {
          heading: 'Combining conditions',
          body: `Use \`and\` when both must hold, \`or\` when either will do, and \`not\` to flip a condition.`,
          code: 'age = 22\nhas_ticket = True\n\nif age >= 18 and has_ticket:\n    print("Welcome in")\n\nif age < 12 or age > 65:\n    print("Discount applies")\n\nif not has_ticket:\n    print("Please buy a ticket")',
        },
        {
          heading: 'One-line form and nesting',
          body: `If a branch is a single short statement you can put it on the same line. Nesting means indenting a whole \`if\` inside another \`if\` — keep it shallow, because deep nesting is hard to read.`,
          code: 'age = 30\n\nif age >= 18: print("Adult")\n\nis_student = False\nif age >= 18:\n    if is_student:\n        print("Student discount")\n    else:\n        print("Standard price")',
        },
      ],
      playground: {
        caption: 'Change the grade and watch a different branch run.',
        starter: 'grade = 85\n\nif grade >= 90:\n    print("A")\nelif grade >= 80:\n    print("B")\nelse:\n    print("C")\n',
      },
      challenge: {
        prompt: 'Classify a number.',
        requirements: [
          'Set `n = 7`',
          'Print `positive` if n is greater than 0',
          'Otherwise print `zero` if n equals 0, or `negative` for anything else',
          'Then print `even` or `odd` based on `n % 2`',
        ],
        starter: 'n = 7\n\n',
        solution:
          'n = 7\n\nif n > 0:\n    print("positive")\nelif n == 0:\n    print("zero")\nelse:\n    print("negative")\n\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")\n',
        checks: [
          { label: 'Sign branch', expect: ['positive'] },
          { label: 'Parity branch', expect: ['odd'] },
          { label: 'Runs without errors', expect: ['positive', 'odd'], forbidError: true },
        ],
        hints: [
          '`n % 2 == 0` is true exactly when n is even.',
          'Change `n` to `-3` or `0` and check the other branches still work.',
        ],
      },
      quiz: [
        {
          prompt: 'What is the result of `5 > 3 == True`?',
          options: ['True', 'False', '1', 'An error'],
          answer: 0,
          explanation: 'Comparisons chain left to right: `5 > 3` is True, and `True == True` is True.',
        },
        {
          prompt: 'How many spaces should the body of an `if` be indented?',
          options: ['Any consistent amount', 'Exactly 2', 'Exactly 4', 'Exactly 8'],
          answer: 2,
          explanation:
            'Four spaces is the PEP 8 convention and what you should use. What actually matters is that the indent is consistent within the block.',
        },
        {
          prompt: 'Which keyword handles every case not matched above?',
          options: ['elif', 'else', 'except', 'default'],
          answer: 1,
          explanation: '`else` is the catch-all branch. `elif` adds another specific test before it.',
        },
      ],
    },

    {
      slug: 'loops',
      order: 7,
      title: 'Loops',
      subtitle: 'for, while, range, break and continue',
      minutes: 13,
      icon: 'repeat',
      xp: 80,
      objectives: [
        'Repeat a block with a `for` loop over `range()`',
        'Loop over a list directly',
        'Repeat until a condition fails with `while`',
        'Escape early with `break` and skip ahead with `continue`',
      ],
      sections: [
        {
          heading: 'Doing something N times',
          body: `A \`for\` loop runs the same block once for every item in a sequence. \`range(n)\` produces the numbers \`0\` to \`n - 1\`, which is exactly what you want for counting.

Note the indentation again — everything indented under \`for\` is the loop body.`,
          code: 'for i in range(5):\n    print(i)\n\n# prints 0, 1, 2, 3, 4',
          list: [
            '`range(5)` → 0, 1, 2, 3, 4',
            '`range(2, 6)` → 2, 3, 4, 5',
            '`range(0, 10, 2)` → 0, 2, 4, 6, 8',
          ],
          callout: {
            tone: 'note',
            title: 'Zero-based',
            body: 'Counting starts at 0, so `range(5)` gives five numbers starting at zero. This trips up nearly everyone once.',
          },
        },
        {
          heading: 'Looping over a list',
          body: `When you already have a list, skip \`range()\` and name the list directly. Inside the loop, the variable takes each value in turn.`,
          code: 'fruits = ["apple", "banana", "cherry"]\n\nfor fruit in fruits:\n    print(f"I like {fruit}")',
        },
        {
          heading: 'When to use while',
          body: `A \`while\` loop repeats **as long as** its condition stays true. Use it when you do not know the count up front — a password prompt, a dice roll, a game.

The condition is checked **before** each pass, so a \`while\` that is false from the start never runs at all.`,
          code: 'countdown = 3\n\nwhile countdown > 0:\n    print(countdown)\n    countdown -= 1\n\nprint("Liftoff!")',
          callout: {
            tone: 'warn',
            title: 'Infinite loops',
            body: 'If you never change the condition, the loop never ends. Always make sure something inside the loop moves the condition towards false.',
          },
        },
        {
          heading: 'break and continue',
          body: `\`break\` abandons the loop entirely. \`continue\` skips the rest of **this** pass and jumps to the next one.`,
          code: 'for n in range(10):\n    if n == 5:\n        break\n    if n % 2 == 0:\n        continue\n    print(n)\n\n# prints 1, 3 — 4 was skipped, 5 stopped the loop',
        },
        {
          heading: 'Counting with a loop',
          body: `Loops shine when you tally something up. Start an accumulator at \`0\`, add to it on every pass, and print it after the loop.`,
          code: 'total = 0\n\nfor price in [4.5, 2.25, 10.0]:\n    total += price\n\nprint(f"Total: {total:.2f}")   # Total: 16.75',
          callout: {
            tone: 'tip',
            title: 'for or while?',
            body: 'Use `for` when you know how many times, or when you are walking a list. Use `while` only when the exit condition is genuinely unknown.',
          },
        },
      ],
      playground: {
        caption: 'Add a break to stop the loop early.',
        starter: 'for i in range(10):\n    print(i)\n',
      },
      challenge: {
        prompt: 'FizzBuzz, the classic warm-up.',
        requirements: [
          'Loop `i` from 1 to 15 using `range(1, 16)`',
          'Print `Fizz` when `i` divides evenly by 3, `Buzz` by 5, `FizzBuzz` by both',
          'Print the number itself otherwise',
        ],
        starter: 'for i in range(1, 16):\n    # check i % 3 and i % 5\n    pass\n',
        solution:
          'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)\n',
        checks: [
          { label: 'Starts at 1', expect: ['1', '2'] },
          { label: 'Fizz at 3, Buzz at 5, both at 15', expect: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'] },
          { label: 'Runs without errors', expect: ['1', 'Fizz'], forbidError: true },
        ],
        hints: [
          'Check the "both" case first with `if i % 15 == 0`, otherwise 15 prints "Fizz".',
          'Order matters: 15 must be tested before 3 and 5.',
        ],
      },
      quiz: [
        {
          prompt: 'How many times does `range(3)` produce a value?',
          options: ['2', '3', '4', 'It depends'],
          answer: 1,
          explanation: '`range(3)` is 0, 1, 2 — three values. It never includes the stop value.',
        },
        {
          prompt: 'What does `continue` do?',
          options: [
            'Stops the loop completely',
            'Skips the rest of this pass and starts the next',
            'Runs the loop once more immediately',
            'Prints a message',
          ],
          answer: 1,
          explanation: '`continue` jumps to the next iteration. Use `break` to leave the loop entirely.',
        },
        {
          prompt: 'When is the condition of a `while` loop checked?',
          options: [
            'Only before the first pass',
            'Before every pass',
            'After every pass',
            'Only when you call break',
          ],
          answer: 1,
          explanation:
            'The condition is tested before each iteration, so a false condition means the body never runs.',
        },
      ],
    },

    {
      slug: 'guessing-game',
      order: 8,
      title: 'Project: Guessing Game',
      subtitle: 'Put the whole module together',
      minutes: 15,
      icon: 'trophy',
      xp: 120,
      objectives: [
        'Combine variables, input, conditionals and loops in one program',
        'Keep a counter and update it inside a loop',
        'Give the player a clear win or lose message',
        'Read a whole program and predict its output',
      ],
      sections: [
        {
          heading: 'The brief',
          body: `Time to build something real. Write a guessing game:

1. Pick a secret number and store it in a variable
2. Ask the player to guess it
3. Tell them whether they were too high, too low, or correct
4. Keep asking until they get it
5. Report how many guesses it took

Every tool from this module appears here — variables to hold state, \`input()\` to read the guess, \`while\` to repeat, and \`if\`/\`elif\`/\`else\` to decide what to say.`,
          code: 'secret = 7\nattempts = 0\n\nwhile True:\n    guess = int(input("Guess a number: "))\n    attempts += 1\n\n    if guess == secret:\n        print(f"Correct in {attempts} guesses!")\n        break\n    elif guess < secret:\n        print("Too low")\n    else:\n        print("Too high")',
          callout: {
            tone: 'note',
            title: 'while True',
            body: '`while True` never ends on its own — a `break` is the only way out. That is idiomatic when you cannot say up front when to stop.',
          },
        },
        {
          heading: 'Why this works',
          body: `Walk through the loop once and the logic is obvious.

The counter starts outside the loop so it survives between passes. Each guess increases it by one. The \`break\` sits **inside** the \`if\`, so a correct answer leaves the loop and everything after it runs exactly once.`,
          code: 'secret = 7\nattempts = 0\n\nwhile True:          # never stops by itself\n    guess = int(input("Guess: "))\n    attempts = attempts + 1\n    if guess == secret:\n        print("Correct!")\n        break           # <-- the only exit\n\nprint(f"It took {attempts}")',
        },
        {
          heading: 'Give the player a way out',
          body: `An unbounded loop is hard to escape if the player is stuck. A generous program offers a way to quit.

The trick is to check the escape **before** converting, so typing \`quit\` does not raise \`ValueError\`.`,
          code: 'secret = 7\n\nwhile True:\n    raw = input("Guess (or q to quit): ")\n    if raw == "q":\n        print("Goodbye!")\n        break\n    guess = int(raw)\n    print("Correct!" if guess == secret else "Wrong")',
          callout: {
            tone: 'tip',
            title: 'Convert late, validate early',
            body: 'Read as text, check for edge cases, then convert. It is more forgiving and easier to extend.',
          },
        },
        {
          heading: 'Add a limit',
          body: `Real games give you a number of turns. A \`for\` loop over \`range()\` is the natural way to express "you get five tries".`,
          code: 'secret = 7\n\nfor attempt in range(1, 6):\n    guess = int(input(f"Guess {attempt}/5: "))\n    if guess == secret:\n        print(f"Correct on attempt {attempt}!")\n        break\nelse:\n    print("Out of tries. Better luck next time!")',
        },
      ],
      playground: {
        caption: 'Play it. Try a few guesses, including a wrong one.',
        starter: 'secret = 7\nattempts = 0\n\nwhile True:\n    guess = int(input("Guess a number: "))\n    attempts += 1\n    if guess == secret:\n        print(f"Correct in {attempts} guesses!")\n        break\n    elif guess < secret:\n        print("Too low")\n    else:\n        print("Too high")\n',
      },
      challenge: {
        prompt: 'Ship the guessing game.',
        requirements: [
          'Set `secret = 42`',
          'Loop, asking `Guess: ` until the player is correct',
          'Print `Too low` or `Too high` for wrong guesses',
          'On success print `Correct in N guesses!` and stop the loop',
        ],
        starter: 'secret = 42\nattempts = 0\n\nwhile True:\n    guess = int(input("Guess: "))\n    # compare, hint, and break when correct\n',
        solution:
          'secret = 42\nattempts = 0\n\nwhile True:\n    guess = int(input("Guess: "))\n    attempts += 1\n    if guess == secret:\n        print(f"Correct in {attempts} guesses!")\n        break\n    elif guess < secret:\n        print("Too low")\n    else:\n        print("Too high")\n',
        checks: [
          { label: 'Shows the prompt', expect: ['Guess: '] },
          { label: 'Hints on a wrong guess', expect: ['Too low', 'Guess: '] },
          { label: 'Reports the attempt count', expect: ['Correct in 1 guesses!'] },
        ],
        hints: [
          'Try 10 first, then 50, then 42 — you should see `Too high`, `Too low`, then the win message.',
          'Remember the `break`. Without it the loop never ends after a correct guess.',
        ],
      },
      quiz: [
        {
          prompt: 'Why is `attempts = 0` placed before the loop?',
          options: [
            'Because Python requires it',
            'So it starts from 0 and keeps its value between passes',
            'To make the loop faster',
            'To print the attempts',
          ],
          answer: 1,
          explanation:
            'A value created inside the loop is thrown away at the end of each pass. Created outside, it survives and can be added to.',
        },
        {
          prompt: 'What happens if you forget the `break` in a `while True` guessing game?',
          options: [
            'The loop runs once',
            'The program asks forever even after a correct guess',
            'Python raises an error',
            'The loop runs zero times',
          ],
          answer: 1,
          explanation: '`while True` has no other exit condition, so only `break` can end it.',
        },
        {
          prompt: 'Which loop fits "let the player keep guessing until correct"?',
          options: ['for', 'while', 'range', 'None of these'],
          answer: 1,
          explanation:
            'You cannot know the number of guesses in advance, so a `while` loop driven by the game state is the right tool.',
        },
      ],
    },
  ],
}

export const lessons: Lesson[] = module1.lessons

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug)
}

/** The lesson a learner should start or continue with. */
export function nextLesson(slug: string | null): Lesson {
  if (!slug) return lessons[0] as Lesson
  const index = lessons.findIndex((lesson) => lesson.slug === slug)
  return lessons[Math.min(index + 1, lessons.length - 1)] as Lesson
}

export function prevLesson(slug: string): Lesson | undefined {
  const index = lessons.findIndex((lesson) => lesson.slug === slug)
  return index > 0 ? lessons[index - 1] : undefined
}
