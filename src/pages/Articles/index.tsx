import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search, MoreVertical, Edit3, Trash2, Eye, EyeOff, Clock, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { useArticleStore } from '../../stores/articleStore'
import { useToast } from '../../components/common/Toast'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Table, type Column } from '../../components/common/Table'
import { Badge } from '../../components/common/Badge'
import { Dropdown } from '../../components/common/Dropdown'
import type { DropdownItem } from '../../components/common/Dropdown'
import { Modal } from '../../components/common/Modal'
import type { Article } from '../../types'

const statusTabs = ['all', 'published', 'draft', 'trash'] as const

const tabIcons: Record<string, React.ReactNode> = {
  all: null,
  published: null,
  draft: null,
  trash: <Trash2 size={14} className="mr-1" />,
}

export default function Articles() {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const {
    articles, total, loading, query,
    fetchArticles, deleteArticle, restoreArticle, publishArticle, unpublishArticle,
    setQuery,
  } = useArticleStore()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Article | null>(null)
  const pageSize = 20

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleTabChange = (tab: string) => {
    const newQuery = { ...query, status: tab === 'all' ? undefined : tab, page: 1 }
    setQuery(newQuery)
    fetchArticles(newQuery)
  }

  const handleSearch = () => {
    const newQuery = { ...query, keyword: searchKeyword || undefined, page: 1 }
    setQuery(newQuery)
    fetchArticles(newQuery)
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('|')
    const newQuery = { ...query, sort_by: sortBy, sort_order: sortOrder, page: 1 }
    setQuery(newQuery)
    fetchArticles(newQuery)
  }

  const handlePageChange = (page: number) => {
    const newQuery = { ...query, page }
    setQuery(newQuery)
    fetchArticles(newQuery)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const statusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success' as const
      case 'draft': return 'warning' as const
      case 'trash': return 'error' as const
      default: return 'default' as const
    }
  }

  const isTrashTab = (query.status || 'all') === 'trash'

  const columns: Column<Article>[] = [
    { key: 'title', title: t('articles.titleColumn'), width: '40%' },
    {
      key: 'status', title: t('articles.statusColumn'), width: '15%',
      render: (_, record) => <Badge variant={statusVariant(record.status)} dot>{t(`articles.${record.status}`)}</Badge>,
    },
    {
      key: 'categories', title: t('articles.categoryColumn'), width: '20%',
      render: (_, record) => (
        <span className="text-[var(--color-text-tertiary)]">
          {record.categories?.map((c: { name: string }) => c.name).join(', ') || '-'}
        </span>
      ),
    },
    {
      key: 'updated_at', title: t('articles.updatedColumn'), width: '15%',
      render: (_, record) => (
        <span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
          <Clock size={12} />
          {new Date(record.updated_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions', title: '', width: '10%',
      render: (_, record) => {
        const items: DropdownItem[] = []

        if (record.status === 'trash') {
          items.push(
            { key: 'restore', label: t('articles.restore'), icon: <RefreshCw size={14} />, onClick: async () => { await restoreArticle(record.id); toast.success(t('articles.restored')) } },
            { key: 'divider', label: '', divider: true },
            { key: 'permanentDelete', label: t('articles.permanentDelete'), icon: <AlertTriangle size={14} />, danger: true, onClick: () => setPermanentDeleteTarget(record) },
          )
        } else {
          items.push(
            { key: 'edit', label: t('common.edit'), icon: <Edit3 size={14} />, onClick: () => navigate(`/editor/${record.id}`) },
          )
          if (record.status === 'draft') {
            items.push({ key: 'publish', label: t('articles.publish'), icon: <Eye size={14} />, onClick: () => { publishArticle(record.id); toast.success(t('articles.published')) } })
          } else if (record.status === 'published') {
            items.push({ key: 'unpublish', label: t('articles.unpublish'), icon: <EyeOff size={14} />, onClick: () => { unpublishArticle(record.id); toast.success(t('articles.unpublished')) } })
          }
          items.push(
            { key: 'divider', label: '', divider: true },
            { key: 'delete', label: t('common.delete'), icon: <Trash2 size={14} />, danger: true, onClick: () => setDeleteTarget(record) },
          )
        }

        return (
          <Dropdown
            trigger={<Button variant="ghost" size="sm"><MoreVertical size={14} /></Button>}
            items={items}
            align="right"
          />
        )
      },
    },
  ]

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteArticle(deleteTarget.id, true)
      toast.success(t('common.deleteSuccess'))
      setDeleteTarget(null)
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget) return
    try {
      await deleteArticle(permanentDeleteTarget.id, false)
      toast.success(t('articles.permanentDeleteSuccess'))
      setPermanentDeleteTarget(null)
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{t('articles.title')}</h1>
        <Button onClick={() => navigate('/editor')}>
          <Plus size={16} className="mr-2" />
          {t('common.create')}
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-0">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors inline-flex items-center ${
              (query.status || 'all') === tab
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tabIcons[tab]}
            {t(`articles.${tab}`)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="max-w-xs">
          <Input
            placeholder={t('articles.searchPlaceholder')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            rightIcon={<Search size={16} className="cursor-pointer" onClick={handleSearch} />}
          />
        </div>
        <Select
          value={`${query.sort_by || 'created_at'}|${query.sort_order || 'desc'}`}
          onChange={(e) => handleSortChange(e.target.value)}
          options={[
            { value: 'created_at|desc', label: t('articles.createdAtDesc') },
            { value: 'created_at|asc', label: t('articles.createdAtAsc') },
            { value: 'updated_at|desc', label: t('articles.updatedAtDesc') },
            { value: 'title|asc', label: t('articles.titleAsc') },
          ]}
          className="w-44"
        />
      </div>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        emptyText={isTrashTab ? t('articles.noTrash') : t('articles.noArticles')}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-text-tertiary)]">
          <span>{t('articles.total', { count: String(total) })}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="sm"
              disabled={query.page === 1}
              onClick={() => handlePageChange((query.page || 1) - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2">
              {query.page || 1} / {totalPages}
            </span>
            <Button
              variant="ghost" size="sm"
              disabled={query.page === totalPages}
              onClick={() => handlePageChange((query.page || 1) + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('articles.confirmDelete')}
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleDelete}>{t('common.delete')}</Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('articles.deleteMessage')}
        </p>
      </Modal>

      <Modal
        open={!!permanentDeleteTarget}
        onClose={() => setPermanentDeleteTarget(null)}
        title={t('articles.confirmPermanentDelete')}
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPermanentDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handlePermanentDelete}>{t('articles.permanentDelete')}</Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{t('articles.permanentDeleteTitle')}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {permanentDeleteTarget && t('articles.permanentDeleteMessage', { title: permanentDeleteTarget.title })}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
