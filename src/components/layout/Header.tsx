import { useTranslation } from 'react-i18next'
import { Sun, Moon, Languages } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const pageTitles: Record<string, string> = {
  '/': 'pageTitle.dashboard',
  '/articles': 'pageTitle.articles',
  '/editor': 'pageTitle.editor',
  '/images': 'pageTitle.images',
  '/deploy': 'pageTitle.deploy',
  '/settings': 'pageTitle.settings',
}

export function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  const titleKey = pageTitles[location.pathname] || 'pageTitle.dashboard'

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN'
    i18n.changeLanguage(nextLang)
  }

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">
        {t(titleKey)}
      </h1>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          title={isDark ? 'Switch to light' : 'Switch to dark'}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          title="Toggle language"
        >
          <Languages size={14} />
          <span className="hidden sm:inline">{i18n.language === 'zh-CN' ? 'EN' : '中文'}</span>
        </button>
      </div>
    </header>
  )
}
