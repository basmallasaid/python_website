# Games section

A mini-game per Python lesson. Kid-friendly, mobile-first, no Python runtime yet —
Lesson 1 fakes `print()` with a small parser.

```
src/games/
  registry.tsx            # the lesson list — add your entry here
  strings.ts              # shared UI strings + fill() for {placeholders}
  components/             # CodeEditor, RunButton, HintButton, ProgressBar,
                          # LevelCompleteModal, FriendlyError, ConfettiHelper
  hooks/
    useProgress.ts        # localStorage: completed levels + stars, per lesson
    useSounds.ts          # tiny WebAudio blips (no audio files), mutable
  lessons/
    01-print-robot/
      index.tsx           # default-exported game component
      levels.ts           # level data + every UI string for this lesson
      checker.ts          # checkCode(code, level) -> { ok, outputs, error }
      Robot.tsx           # animated SVG robot + speech bubble
```

## Add a new lesson game in 3 steps

**1. Create the folder**

```
src/games/lessons/02-variables/
```

**2. Add the four files**

| File | What goes in it |
| --- | --- |
| `index.tsx` | The game component. Must `export default`. Compose the shared `components/` pieces and keep every user-facing string in `levels.ts`. |
| `levels.ts` | Export `LESSON_ID`, `LEVELS` and `LESSON_STRINGS` (level data + all copy). |
| `checker.ts` | Export `checkCode(code, level)` returning `{ ok, outputs, error: { type, friendlyMessage } }`. |
| Stage visuals | e.g. `Robot.tsx`. Plain SVG + Tailwind, no image files. |

Copy `01-print-robot` and reshape it — it is the reference implementation.

**3. Add one registry entry in `registry.tsx`**

```tsx
const VariablesGame = lazy(() => import('./lessons/02-variables/index'))

export const GAMES: GameLesson[] = [
  // …
  {
    id: '02-variables',                  // must match the folder name
    order: 2,
    title: 'Variables: Name That Thing',
    description: 'Store values in boxes.',
    icon: Variable,                      // any Lucide icon
    gradient: 'from-success-500 to-success-700', // full class strings only
    component: VariablesGame,
  },
]
```

That is it. `/games` picks up the card, `/games/02-variables` renders the game,
and the lesson unlocks once every earlier lesson is complete.

## Adding a real Python runtime later

`checkCode(code, level)` in each lesson's `checker.ts` is the only seam. Swap the
body for Pyodide (or an API call) and return the same shape — every component,
the levels data and the hub keep working untouched.
