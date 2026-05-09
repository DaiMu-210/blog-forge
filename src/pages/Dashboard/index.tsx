import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Edit3, Clock, Trash2, Plus, Eye, ArrowRight, Globe } from 'lucide-react'
import { open } from '@tauri-apps/plugin-shell'
import { useArticleStore } from '../../stores/articleStore'
import { useToast } from '../../components/common/Toast'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { Loading } from '../../components/common/Loading'
import { api } from '../../api'

export default function Dashboard() {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const { articles, loading, total, fetchArticles, fetchTags, fetchCategories } = useArticleStore()
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    fetchArticles({ page: 1, page_size: 5, sort_by: 'updated_at', sort_order: 'desc' })
    fetchTags()
    fetchCategories()
  }, [])

  const stats = useMemo(() => {
    const all = articles || []
    const allTotal = total || 0
    const published = all.filter((a) => a.status === 'published').length
    const drafts = all.filter((a) => a.status === 'draft').length
    const trash = all.filter((a) => a.status === 'trash').length
    return { total: allTotal, published, drafts, trash }
  }, [articles, total])

  const statCards = [
    { key: 'total', label: t('dashboard.totalArticles'), value: stats.total, icon: FileText, color: 'text-[var(--color-primary)]', bg: 'bg-blue-50 dark:bg-blue-950' },
    { key: 'published', label: t('dashboard.publishedArticles'), value: stats.published, icon: Eye, color: 'text-[var(--color-success)]', bg: 'bg-green-50 dark:bg-green-950' },
    { key: 'drafts', label: t('dashboard.draftArticles'), value: stats.drafts, icon: Edit3, color: 'text-[var(--color-warning)]', bg: 'bg-yellow-50 dark:bg-yellow-950' },
    { key: 'trash', label: t('dashboard.trashArticles'), value: stats.trash, icon: Trash2, color: 'text-[var(--color-error)]', bg: 'bg-red-50 dark:bg-red-950' },
  ]

  const statusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success' as const
      case 'draft': return 'warning' as const
      case 'trash': return 'error' as const
      default: return 'default' as const
    }
  }

  const handlePreviewSite = async () => {
    setPreviewing(true)
    try {
      const result = await api.deploy.previewSite()
      await open(result.url)
      toast.success(t('editor.previewSiteOpened'))
    } catch (e) {
      console.error('Preview site error:', e)
      const msg = typeof e === 'string' ? e : (e as Error)?.message || String(e)
      toast.error(msg)
    } finally {
      setPreviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePreviewSite} loading={previewing}>
            <Globe size={16} className="mr-2" />
            {t('editor.previewSite')}
          </Button>
          <Button onClick={() => navigate('/editor')}>
            <Plus size={16} className="mr-2" />
            {t('dashboard.newArticle')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.key}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-tertiary)]">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('dashboard.recentArticles')}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/articles')}>
            {t('common.viewAll')} <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        {loading ? (
          <Loading size="md" text={t('common.loading')} />
        ) : articles.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
            {t('common.noData')}
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3 hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                onClick={() => navigate(`/editor/${article.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{article.title}</span>
                  <Badge variant={statusVariant(article.status)} dot>
                    {t(`articles.${article.status}`)}
                  </Badge>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1 shrink-0">
                  <Clock size={12} />
                  {new Date(article.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
