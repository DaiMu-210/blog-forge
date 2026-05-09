import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  FileText,
  Image,
  Rocket,
  Settings,
  ChevronLeft,
  ChevronRight,
  PenLine,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/articles', icon: FileText, labelKey: 'nav.articles' },
  { to: '/editor', icon: PenLine, labelKey: 'nav.editor' },
  { to: '/images', icon: Image, labelKey: 'nav.images' },
  { to: '/deploy', icon: Rocket, labelKey: 'nav.deploy' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <aside
      className={`flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center h-12 px-4 border-b border-[var(--color-border)]">
        {!collapsed && (
          <span className="text-sm font-bold text-[var(--color-primary)] tracking-wide">
            BLOGFORGE
          </span>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 mx-2 mb-1 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          )
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  )
}
