import { Fragment, type ReactNode } from 'react'
import { Lightbulb, NotebookPen, TriangleAlert } from 'lucide-react'
import type { CalloutTone, LessonSection } from '../../content/lessons/types'
import { CodeBlock } from '../code/CodeBlock'

const TONE_STYLES: Record<CalloutTone, { wrap: string; icon: ReactNode; label: string }> = {
  tip: {
    wrap: 'border-sun-200 bg-sun-50',
    icon: <Lightbulb className="size-4 text-warn-600" aria-hidden="true" />,
    label: 'Tip',
  },
  warn: {
    wrap: 'border-danger-200 bg-danger-50',
    icon: <TriangleAlert className="size-4 text-danger-600" aria-hidden="true" />,
    label: 'Watch out',
  },
  note: {
    wrap: 'border-python-200 bg-python-50',
    icon: <NotebookPen className="size-4 text-python-600" aria-hidden="true" />,
    label: 'Note',
  },
}

/**
 * Renders the small markdown subset used in lesson copy: `code`, **bold**, and
 * blank-line-separated paragraphs. Everything becomes real React nodes, so
 * there is no HTML injection surface.
 */
export function RichText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/)

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{renderInline(paragraph)}</p>
      ))}
    </>
  )
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Split on `code` and **bold** while keeping the delimiters as markers.
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  let key = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>)
    }
    const token = match[0]
    if (token.startsWith('`')) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>)
    } else {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>)
  }
  return nodes
}

export function Callout({
  tone,
  title,
  body,
}: {
  tone: CalloutTone
  title: string
  body: string
}) {
  const style = TONE_STYLES[tone]
  return (
    <aside className={`flex gap-3 rounded-xl border p-4 ${style.wrap}`}>
      <span className="mt-0.5 shrink-0">{style.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-600">
          <RichText text={body} />
        </p>
      </div>
    </aside>
  )
}

export function LessonSectionBlock({ section }: { section: LessonSection }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink-900">{section.heading}</h2>

      <div className="prose-lesson">
        <RichText text={section.body} />
      </div>

      {section.code ? <CodeBlock code={section.code} /> : null}

      {section.list ? (
        <ul className="flex flex-col gap-2">
          {section.list.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-600">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-python-400" aria-hidden="true" />
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.callout ? <Callout {...section.callout} /> : null}
    </section>
  )
}
