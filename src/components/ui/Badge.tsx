import type { HTMLAttributes, ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger'

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
  brand: 'bg-python-50 text-python-700 ring-python-200',
  success: 'bg-success-50 text-success-700 ring-success-200',
  warn: 'bg-warn-50 text-warn-700 ring-warn-200',
  danger: 'bg-danger-50 text-danger-700 ring-danger-200',
}

export function Badge({
  tone = 'neutral',
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
