import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Save, Send, ArrowLeft, Clock, RotateCcw, Settings, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { useArticleStore } from '../../stores/articleStore'
import { useToast } from '../../components/common/Toast'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Textarea } from '../../components/common/Textarea'
import { Select } from '../../components/common/Select'
import { Modal } from '../../components/common/Modal'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Loading } from '../../components/common/Loading'
import MarkdownPreview from '../../components/editor/MarkdownPreview'
import { api } from '../../api'

export default function Editor() {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isNew = !id

  const {
    currentArticle, versions, loading,
    fetchArticle, createArticle, updateArticle, publishArticle,
    fetchVersions, restoreVersion,
    tags, categories, fetchTags, fetchCategories,
  } = useArticleStore()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [saving, setSaving] = useState(false)
  const [showMeta, setShowMeta] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    fetchTags()
    fetchCategories()
    if (!isNew && id) {
      fetchArticle(Number(id))
      fetchVersions(Number(id))
    }
  }, [id])

  useEffect(() => {
    if (currentArticle && !isNew) {
      setTitle(currentArticle.title)
      setSlug(currentArticle.slug)
      setContent(currentArticle.content)
      setExcerpt(currentArticle.excerpt)
      setCoverImage(currentArticle.cover_image)
      setMetaTitle(currentArticle.meta_title)
      setMetaDescription(currentArticle.meta_description)
      setMetaKeywords(currentArticle.meta_keywords)
      setCategoryId(currentArticle.categories?.[0]?.id)
      setSelectedTagIds(currentArticle.tags?.map((t) => t.id) || [])
    }
  }, [currentArticle])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (isNew && !slug) {
      setSlug(generateSlug(value))
    }
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error(t('editor.titleRequired'))
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const article = await createArticle({
          title,
          slug: slug || undefined,
          content,
          excerpt: excerpt || undefined,
          cover_image: coverImage || undefined,
          category_id: categoryId,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          meta_keywords: metaKeywords || undefined,
          status: 'draft',
        })
        toast.success(t('editor.savedDraft'))
        navigate(`/editor/${article.id}`, { replace: true })
      } else {
        await updateArticle(Number(id), {
          title,
          slug: slug || undefined,
          content,
          excerpt: excerpt || undefined,
          cover_image: coverImage || undefined,
          category_id: categoryId,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          meta_keywords: metaKeywords || undefined,
          status: 'draft',
        })
        toast.success(t('editor.savedDraft'))
      }
    } catch (e) {
      console.error('Save error:', e)
      const msg = typeof e === 'string' ? e : (e as Error)?.message || String(e)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error(t('editor.titleRequired'))
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const article = await createArticle({
          title,
          slug: slug || undefined,
          content,
          excerpt: excerpt || undefined,
          cover_image: coverImage || undefined,
          category_id: categoryId,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          meta_keywords: metaKeywords || undefined,
          status: 'published',
        })
        toast.success(t('editor.published'))
        navigate(`/editor/${article.id}`, { replace: true })
      } else {
        await updateArticle(Number(id), {
          title,
          slug: slug || undefined,
          content,
          excerpt: excerpt || undefined,
          cover_image: coverImage || undefined,
          category_id: categoryId,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          meta_keywords: metaKeywords || undefined,
          status: 'published',
        })
        await publishArticle(Number(id))
        toast.success(t('editor.published'))
      }
    } catch (e) {
      console.error('Publish error:', e)
      const msg = typeof e === 'string' ? e : (e as Error)?.message || String(e)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const handleRestore = async (versionId: number) => {
    if (!id) return
    try {
      await restoreVersion(Number(id), versionId)
      await fetchArticle(Number(id))
      setShowVersions(false)
      toast.success(t('editor.restored'))
    } catch (e) {
      console.error('Restore error:', e)
      const msg = typeof e === 'string' ? e : (e as Error)?.message || String(e)
      toast.error(msg)
    }
  }

  const handlePreviewArticle = async () => {
    if (!id) {
      toast.error(t('editor.previewNewArticle'))
      return
    }
    try {
      const html = await api.article.preview(Number(id))
      setPreviewHtml(html)
      setShowPreviewModal(true)
    } catch (e) {
      console.error('Preview error:', e)
      const msg = typeof e === 'string' ? e : (e as Error)?.message || String(e)
      toast.error(msg)
    }
  }

  if (!isNew && loading) {
    return <Loading size="lg" text={t('common.loading')} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/articles')}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            {isNew ? t('editor.newArticle') : t('editor.editArticle')}
          </h1>
          {!isNew && currentArticle && (
            <Badge variant={currentArticle.status === 'published' ? 'success' : 'warning'} dot>
              {t(`articles.${currentArticle.status}`)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={showPreview ? '' : 'opacity-60'}
          >
            {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="ml-1 hidden sm:inline">{t('editor.togglePreview')}</span>
          </Button>
          <div className="w-px h-5 bg-[var(--color-border)]" />
          {!isNew && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { fetchVersions(Number(id)); setShowVersions(true) }}>
                <Clock size={14} className="mr-1" /> {t('editor.versions')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePreviewArticle}>
                <ExternalLink size={14} className="mr-1" /> {t('editor.previewArticle')}
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowMeta(!showMeta)}>
            <Settings size={14} className="mr-1" /> {t('editor.meta')}
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} loading={saving}>
            <Save size={14} className="mr-1" /> {t('common.save')}
          </Button>
          <Button onClick={handlePublish} loading={saving}>
            <Send size={14} className="mr-1" /> {t('editor.publish')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Input
            placeholder={t('editor.titlePlaceholder')}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            size="lg"
            className="text-lg font-semibold"
          />

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <span className="shrink-0">{t('editor.slug')}:</span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              size="sm"
              className="flex-1 min-w-0"
              placeholder="article-slug"
            />
          </div>

          <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            <Textarea
              placeholder={t('editor.contentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            {showPreview && (
              <div className="border border-[var(--color-border)] rounded-lg overflow-hidden min-h-[400px]">
                <div className="px-3 py-2 text-xs font-medium text-[var(--color-text-tertiary)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  {t('common.preview')}
                </div>
                <MarkdownPreview content={content} className="p-4" />
              </div>
            )}
          </div>

          {showMeta && (
            <Card>
              <h3 className="text-sm font-semibold mb-3">{t('editor.seoSettings')}</h3>
              <div className="space-y-3">
                <Input
                  label={t('editor.metaTitle')}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <Textarea
                  label={t('editor.metaDescription')}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <Input
                  label={t('editor.metaKeywords')}
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold mb-3">{t('editor.properties')}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                  {t('editor.category')}
                </label>
                <Select
                  value={categoryId ? String(categoryId) : ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                  placeholder={t('editor.selectCategory')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                  {t('editor.tags')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-[var(--color-text-tertiary)]">{t('common.noData')}</span>
                  )}
                </div>
              </div>

              <Textarea
                label={t('editor.excerpt')}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={t('editor.excerptPlaceholder')}
              />

              <Input
                label={t('editor.coverImage')}
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={showVersions}
        onClose={() => setShowVersions(false)}
        title={t('editor.versionHistory')}
        width="lg"
      >
        {versions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)] py-4 text-center">
            {t('editor.noVersions')}
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{v.title}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleRestore(v.id)}>
                  <RotateCcw size={14} className="mr-1" /> {t('editor.restore')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={t('editor.previewArticle')}
        width="xl"
      >
        <iframe
          srcDoc={previewHtml}
          className="w-full h-[75vh] border-0 rounded"
          title={t('editor.previewArticle')}
        />
      </Modal>
    </div>
  )
}
