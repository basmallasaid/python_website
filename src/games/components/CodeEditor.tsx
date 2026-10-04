import { lazy, Suspense } from 'react'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

/**
 * Dark Python editor with line numbers.
 *
 * CodeMirror touches `document` on mount, so it is loaded lazily and the first
 * paint falls back to a styled textarea. That also gives a graceful, usable
 * editor if the heavy chunk ever fails to load.
 */
const CodeMirrorEditor = lazy(() =>
  import('@uiw/react-codemirror').then((m) => ({ default: m.default })),
)

export type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  height?: string
  label: string
}

function Fallback({
  value,
  onChange,
  height,
  label,
}: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      className="scroll-thin w-full resize-y rounded-2xl border border-ink-700 bg-ink-900 px-4 py-3 font-mono text-[15px] leading-7 text-ink-50 outline-none placeholder:text-ink-500 focus-visible:border-python-500"
      style={{ height }}
    />
  )
}

export function CodeEditor(props: CodeEditorProps) {
  const { value, onChange, height = '170px', label } = props

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-inner focus-within:border-python-500">
      <Suspense fallback={<Fallback {...props} />}>
        <CodeMirrorEditor
          value={value}
          onChange={onChange}
          height={height}
          aria-label={label}
          theme={oneDark}
          extensions={[python(), EditorView.lineWrapping]}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            autocompletion: false,
            searchKeymap: false,
          }}
        />
      </Suspense>
    </div>
  )
}
