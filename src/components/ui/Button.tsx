import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-python-600 text-white shadow-soft hover:bg-python-700 active:bg-python-800 disabled:bg-ink-300',
  secondary:
    'bg-surface text-ink-700 border border-ink-200 shadow-soft hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100 disabled:text-ink-400',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 disabled:text-ink-300',
  danger:
    'bg-danger-600 text-white shadow-soft hover:bg-danger-700 active:bg-danger-700 disabled:bg-ink-300',
  success:
    'bg-success-600 text-white shadow-soft hover:bg-success-700 active:bg-success-700 disabled:bg-ink-300',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    className = '',
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  )
})
