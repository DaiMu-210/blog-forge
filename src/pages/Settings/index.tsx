import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Plus, Edit3, Trash2, Tag, FolderTree, FileText, Globe } from 'lucide-react'
import { useConfigStore } from '../../stores/configStore'
import { useArticleStore } from '../../stores/articleStore'
import { useToast } from '../../components/common/Toast'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Textarea } from '../../components/common/Textarea'
import { Card } from '../../components/common/Card'
import { Modal } from '../../components/common/Modal'
import { Loading } from '../../components/common/Loading'
import type { SiteConfigEntry } from '../../types'

export default function Settings() {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    siteConfig, customPages, loading: configLoading,
    fetchSiteConfig, updateSiteConfig,
    fetchCustomPages, createCustomPage, updateCustomPage, deleteCustomPage,
  } = useConfigStore()
  const {
    tags, categories, fetchTags, fetchCategories,
    createTag, updateTag, deleteTag,
    createCategory, updateCategory, deleteCategory,
  } = useArticleStore()

  const [configEntries, setConfigEntries] = useState<SiteConfigEntry[]>([])
  const [savingConfig, setSavingConfig] = useState(false)

  const [showTagModal, setShowTagModal] = useState(false)
  const [editingTag, setEditingTag] = useState<number | null>(null)
  const [tagForm, setTagForm] = useState({ name: '', slug: '', color: '' })

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', parentId: '', sortOrder: '0' })

  const [showPageModal, setShowPageModal] = useState(false)
  const [editingPage, setEditingPage] = useState<number | null>(null)
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', layout: '', isPublished: true })

  useEffect(() => {
    fetchSiteConfig()
    fetchCustomPages()
    fetchTags()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (siteConfig) {
      setConfigEntries(siteConfig)
    }
  }, [siteConfig])

  const getConfigValue = (key: string): string => {
    const entry = configEntries.find((e) => e.key === key)
    return entry?.value || ''
  }

  const setConfigValue = (key: string, value: string) => {
    setConfigEntries((prev) => {
      const idx = prev.findIndex((e) => e.key === key)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], value }
        return next
      }
      return [...prev, { key, value }]
    })
  }

  const handleSaveSiteConfig = async () => {
    setSavingConfig(true)
    try {
      await updateSiteConfig(configEntries)
      toast.success(t('settings.configSaved'))
    } catch {
      toast.error(t('settings.saveError'))
    } finally {
      setSavingConfig(false)
    }
  }

  const openTagModal = (id?: number) => {
    if (id) {
      const tag = tags.find((t) => t.id === id)
      if (tag) { setTagForm({ name: tag.name, slug: tag.slug, color: tag.color }); setEditingTag(id) }
    } else {
      setTagForm({ name: '', slug: '', color: '' }); setEditingTag(null)
    }
    setShowTagModal(true)
  }

  const handleSaveTag = async () => {
    if (!tagForm.name.trim()) return
    try {
      if (editingTag) {
        await updateTag(editingTag, tagForm.name, tagForm.slug, tagForm.color)
        toast.success(t('common.updateSuccess'))
      } else {
        await createTag(tagForm.name, tagForm.slug, tagForm.color)
        toast.success(t('common.createSuccess'))
      }
      setShowTagModal(false)
    } catch {
      toast.error(t('common.saveError'))
    }
  }

  const openCategoryModal = (id?: number) => {
    if (id) {
      const cat = categories.find((c) => c.id === id)
      if (cat) {
        setCategoryForm({ name: cat.name, slug: cat.slug, parentId: cat.parent_id ? String(cat.parent_id) : '', sortOrder: String(cat.sort_order) })
        setEditingCategory(id)
      }
    } else {
      setCategoryForm({ name: '', slug: '', parentId: '', sortOrder: '0' })
      setEditingCategory(null)
    }
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return
    try {
      const parId: number | null = categoryForm.parentId ? Number(categoryForm.parentId) : null
      const sort = Number(categoryForm.sortOrder) || 0
      if (editingCategory) {
        await updateCategory(editingCategory, categoryForm.name, categoryForm.slug, parId, sort)
        toast.success(t('common.updateSuccess'))
      } else {
        await createCategory(categoryForm.name, categoryForm.slug, parId, sort)
        toast.success(t('common.createSuccess'))
      }
      setShowCategoryModal(false)
    } catch {
      toast.error(t('common.saveError'))
    }
  }

  const openPageModal = (id?: number) => {
    if (id) {
      const page = customPages.find((p) => p.id === id)
      if (page) {
        setPageForm({ title: page.title, slug: page.slug, content: page.content, layout: page.layout, isPublished: page.is_published })
        setEditingPage(id)
      }
    } else {
      setPageForm({ title: '', slug: '', content: '', layout: '', isPublished: true })
      setEditingPage(null)
    }
    setShowPageModal(true)
  }

  const handleSavePage = async () => {
    if (!pageForm.title.trim()) return
    try {
      if (editingPage) {
        await updateCustomPage(editingPage, pageForm.title, pageForm.slug, pageForm.content, pageForm.layout, pageForm.isPublished)
        toast.success(t('common.updateSuccess'))
      } else {
        await createCustomPage(pageForm.title, pageForm.slug, pageForm.content, pageForm.layout)
        toast.success(t('common.createSuccess'))
      }
      setShowPageModal(false)
    } catch {
      toast.error(t('common.saveError'))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{t('nav.settings')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">{t('settings.siteSettings')}</h2>
              <Button onClick={handleSaveSiteConfig} loading={savingConfig}>
                <Save size={14} className="mr-2" />
                {t('common.save')}
              </Button>
            </div>

            {configLoading ? (
              <Loading size="md" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('settings.siteName')}
                  value={getConfigValue('site_name')}
                  onChange={(e) => setConfigValue('site_name', e.target.value)}
                  placeholder="My Blog"
                  leftIcon={<Globe size={14} />}
                />
                <Input
                  label={t('settings.author')}
                  value={getConfigValue('author')}
                  onChange={(e) => setConfigValue('author', e.target.value)}
                  placeholder="John Doe"
                />
                <Textarea
                  label={t('settings.siteDescription')}
                  value={getConfigValue('site_description')}
                  onChange={(e) => setConfigValue('site_description', e.target.value)}
                  placeholder={t('settings.siteDescriptionPlaceholder')}
                />
                <Input
                  label={t('settings.siteUrl')}
                  value={getConfigValue('site_url')}
                  onChange={(e) => setConfigValue('site_url', e.target.value)}
                  placeholder="https://example.com"
                />
                <Input
                  label={t('settings.language')}
                  value={getConfigValue('language')}
                  onChange={(e) => setConfigValue('language', e.target.value)}
                  placeholder="zh-CN"
                />
                <Input
                  label={t('settings.timezone')}
                  value={getConfigValue('timezone')}
                  onChange={(e) => setConfigValue('timezone', e.target.value)}
                  placeholder="Asia/Shanghai"
                />
                <Input
                  label={t('settings.postsPerPage')}
                  value={getConfigValue('posts_per_page')}
                  onChange={(e) => setConfigValue('posts_per_page', e.target.value)}
                  placeholder="10"
                />
                <Input
                  label={t('settings.feedUrl')}
                  value={getConfigValue('feed_url')}
                  onChange={(e) => setConfigValue('feed_url', e.target.value)}
                  placeholder="/rss.xml"
                />
                <Textarea
                  label={t('settings.footerText')}
                  value={getConfigValue('footer_text')}
                  onChange={(e) => setConfigValue('footer_text', e.target.value)}
                  placeholder={t('settings.footerTextPlaceholder')}
                />
                <Input
                  label={t('settings.gaId')}
                  value={getConfigValue('ga_id')}
                  onChange={(e) => setConfigValue('ga_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Tag size={14} /> {t('settings.tags')}
            </h2>
            <Button size="sm" onClick={() => openTagModal()}>
              <Plus size={12} className="mr-1" />
              {t('common.create')}
            </Button>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between rounded-md bg-[var(--color-bg-secondary)] px-3 py-1.5">
                <span className="text-sm">{tag.name} <span className="text-xs text-[var(--color-text-tertiary)]">{tag.slug}</span></span>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" onClick={() => openTagModal(tag.id)}><Edit3 size={12} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { deleteTag(tag.id); toast.success(t('common.deleteSuccess')) }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
            {tags.length === 0 && <p className="text-xs text-[var(--color-text-tertiary)] py-2">{t('common.noData')}</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <FolderTree size={14} /> {t('settings.categories')}
            </h2>
            <Button size="sm" onClick={() => openCategoryModal()}>
              <Plus size={12} className="mr-1" />
              {t('common.create')}
            </Button>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-md bg-[var(--color-bg-secondary)] px-3 py-1.5">
                <span className="text-sm">{cat.name}</span>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" onClick={() => openCategoryModal(cat.id)}><Edit3 size={12} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { deleteCategory(cat.id); toast.success(t('common.deleteSuccess')) }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-xs text-[var(--color-text-tertiary)] py-2">{t('common.noData')}</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <FileText size={14} /> {t('settings.customPages')}
            </h2>
            <Button size="sm" onClick={() => openPageModal()}>
              <Plus size={12} className="mr-1" />
              {t('common.create')}
            </Button>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {customPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between rounded-md bg-[var(--color-bg-secondary)] px-3 py-1.5">
                <span className="text-sm">{page.title} <span className="text-xs text-[var(--color-text-tertiary)]">/{page.slug}</span></span>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" onClick={() => openPageModal(page.id)}><Edit3 size={12} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { deleteCustomPage(page.id); toast.success(t('common.deleteSuccess')) }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
            {customPages.length === 0 && <p className="text-xs text-[var(--color-text-tertiary)] py-2">{t('common.noData')}</p>}
          </div>
        </Card>
      </div>

      <Modal open={showTagModal} onClose={() => setShowTagModal(false)} title={editingTag ? t('common.edit') : t('settings.addTag')} width="sm"
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowTagModal(false)}>{t('common.cancel')}</Button><Button onClick={handleSaveTag}>{t('common.save')}</Button></div>}>
        <div className="space-y-3">
          <Input label={t('settings.tagName')} value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })} />
          <Input label={t('settings.tagSlug')} value={tagForm.slug} onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })} />
          <Input label="Color" value={tagForm.color} onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })} placeholder="#3b82f6" />
        </div>
      </Modal>

      <Modal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} title={editingCategory ? t('common.edit') : t('settings.addCategory')} width="sm"
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCategoryModal(false)}>{t('common.cancel')}</Button><Button onClick={handleSaveCategory}>{t('common.save')}</Button></div>}>
        <div className="space-y-3">
          <Input label={t('settings.categoryName')} value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
          <Input label={t('settings.categorySlug')} value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
          <Input label={t('settings.parentId')} value={categoryForm.parentId} onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })} />
          <Input label={t('settings.sortOrder')} value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: e.target.value })} />
        </div>
      </Modal>

      <Modal open={showPageModal} onClose={() => setShowPageModal(false)} title={editingPage ? t('common.edit') : t('settings.addPage')} width="md"
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowPageModal(false)}>{t('common.cancel')}</Button><Button onClick={handleSavePage}>{t('common.save')}</Button></div>}>
        <div className="space-y-3">
          <Input label={t('settings.pageTitle')} value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} />
          <Input label={t('settings.pageSlug')} value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} />
          <Textarea label={t('settings.pageContent')} value={pageForm.content} onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} placeholder={t('common.markdownHint')} className="min-h-[200px]" />
        </div>
      </Modal>
    </div>
  )
}
