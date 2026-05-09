import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-shadow duration-200 ${
        hoverable ? 'cursor-pointer hover:shadow-md' : 'shadow-sm'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
