import React from 'react'

export interface Column<T> {
  key: string
  title: string
  render?: (value: unknown, record: T, index: number) => React.ReactNode
  width?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  dataSource: T[]
  rowKey: keyof T | ((record: T) => string)
  loading?: boolean
  emptyText?: string
  className?: string
}

export function Table<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  emptyText = 'No data',
  className = '',
}: TableProps<T>) {
  const getKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(record)
    return String(record[rowKey] ?? index)
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-[var(--color-border)] ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </div>
              </td>
            </tr>
          ) : dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                {emptyText}
              </td>
            </tr>
          ) : (
            dataSource.map((record, index) => (
              <tr
                key={getKey(record, index)}
                className="transition-colors hover:bg-[var(--color-bg-secondary)]"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                    {(() => { const v = (record as Record<string, unknown>)[col.key]; return col.render ? col.render(v, record, index) : String(v ?? '') })()}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
