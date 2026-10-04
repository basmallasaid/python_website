import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-ink-200/80 bg-surface shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  className = '',
}: {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-ink-200/70 px-5 py-4 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-python-50 text-python-600">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
