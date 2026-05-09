import React, { useState, useRef, useEffect, useCallback } from 'react'

export interface DropdownItem {
  key: string
  label: string
  icon?: React.ReactNode
  danger?: boolean
  divider?: boolean
  onClick?: () => void
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, items, align = 'left', className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const style: React.CSSProperties = {
      position: 'fixed',
      top: rect.bottom + 4,
      zIndex: 9999,
      minWidth: 160,
    }
    if (align === 'right') {
      style.right = document.documentElement.clientWidth - rect.right
    } else {
      style.left = rect.left
    }
    setMenuStyle(style)
  }, [align])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      updatePosition()
      document.addEventListener('mousedown', handleClick)
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        document.removeEventListener('mousedown', handleClick)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [open, updatePosition])

  return (
    <>
      <div ref={triggerRef} className={`inline-block ${className}`}>
        <div onClick={() => setOpen(!open)} className="cursor-pointer">
          {trigger}
        </div>
      </div>
      {open && (
        <div
          ref={menuRef}
          style={menuStyle}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-lg"
        >
          {items.map((item) =>
            item.divider ? (
              <div key={item.key} className="my-1 border-t border-[var(--color-border)]" />
            ) : (
              <button
                key={item.key}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  item.danger
                    ? 'text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-950'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                }`}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  )
}
