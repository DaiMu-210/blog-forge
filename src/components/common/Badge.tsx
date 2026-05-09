import React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
  success: 'bg-green-50 dark:bg-green-950 text-[var(--color-success)]',
  warning: 'bg-yellow-50 dark:bg-yellow-950 text-[var(--color-warning)]',
  error: 'bg-red-50 dark:bg-red-950 text-[var(--color-error)]',
  info: 'bg-blue-50 dark:bg-blue-950 text-[var(--color-primary)]',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-text-tertiary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
  info: 'bg-[var(--color-primary)]',
}

export function Badge({ children, variant = 'default', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}
