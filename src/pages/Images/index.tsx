import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import { useImageStore } from '../../stores/imageStore'
import { useToast } from '../../components/common/Toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Modal } from '../../components/common/Modal'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Loading } from '../../components/common/Loading'
import { Badge } from '../../components/common/Badge'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Images() {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    images, imagebeds, loading,
    fetchImages, uploadImage, deleteImage,
    fetchImagebeds, createImagebed, updateImagebed, deleteImagebed, setDefaultImagebed,
  } = useImageStore()

  const [selectedImagebed, setSelectedImagebed] = useState<string>('')
  const [showImagebedModal, setShowImagebedModal] = useState(false)
  const [editingImagebed, setEditingImagebed] = useState<number | null>(null)
  const [imagebedForm, setImagebedForm] = useState({ name: '', method: 'local', configJson: '{}' })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    fetchImages()
    fetchImagebeds()
  }, [])

  useEffect(() => {
    fetchImages(selectedImagebed ? Number(selectedImagebed) : undefined)
  }, [selectedImagebed])

  const handleUpload = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files
        if (!files) return
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const reader = new FileReader()
          reader.onload = async (re) => {
            const base64 = (re.target?.result as string).split(',')[1]
            await uploadImage(base64, selectedImagebed ? Number(selectedImagebed) : undefined)
          }
          reader.readAsDataURL(file)
        }
        toast.success(t('images.uploadSuccess'))
      }
      input.click()
    } catch {
      toast.error(t('images.uploadError'))
    }
  }

  const handleDelete = async (id: number) => {
    await deleteImage(id)
    toast.success(t('common.deleteSuccess'))
  }

  const openImagebedModal = (id?: number) => {
    if (id) {
      const item = imagebeds.find((ib) => ib.id === id)
      if (item) {
        setImagebedForm({ name: item.name, method: item.method, configJson: item.config })
        setEditingImagebed(id)
      }
    } else {
      setImagebedForm({ name: '', method: 'local', configJson: '{}' })
      setEditingImagebed(null)
    }
    setShowImagebedModal(true)
  }

  const handleSaveImagebed = async () => {
    try {
      if (editingImagebed) {
        await updateImagebed(editingImagebed, imagebedForm.name, imagebedForm.method, imagebedForm.configJson)
        toast.success(t('common.updateSuccess'))
      } else {
        await createImagebed(imagebedForm.name, imagebedForm.method, imagebedForm.configJson)
        toast.success(t('common.createSuccess'))
      }
      setShowImagebedModal(false)
    } catch {
      toast.error(t('common.saveError'))
    }
  }

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    toast.success(t('images.copied'))
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{t('nav.images')}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleUpload}>
            <Upload size={16} className="mr-2" />
            {t('images.upload')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select
          options={[{ value: '', label: t('images.allImagebeds') }, ...imagebeds.map((ib) => ({ value: String(ib.id), label: ib.name }))]}
          value={selectedImagebed}
          onChange={(e) => setSelectedImagebed(e.target.value)}
          className="w-48"
        />
        <div className="shrink-0">
          <Button variant="outline" size="sm" onClick={() => openImagebedModal()} className="whitespace-nowrap">
            {t('images.manageImagebeds')}
          </Button>
        </div>
      </div>

      {loading ? (
        <Loading size="lg" text={t('common.loading')} />
      ) : images.length === 0 ? (
        <Card className="py-16 text-center text-[var(--color-text-tertiary)]">
          <Upload size={48} className="mx-auto mb-4 opacity-30" />
          <p>{t('images.noImages')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="p-2 group">
              <div className="relative aspect-square rounded-md overflow-hidden bg-[var(--color-bg-secondary)] mb-2">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700"
                    onClick={() => setPreviewUrl(img.url)}
                    title={t('common.preview')}
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700"
                    onClick={() => handleCopyUrl(img.url, img.id)}
                    title={t('images.copyUrl')}
                  >
                    {copied === img.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <button
                    className="p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-red-500"
                    onClick={() => handleDelete(img.id)}
                    title={t('common.delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] truncate" title={img.filename}>{img.filename}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">{formatSize(img.size)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title={t('images.preview')} width="xl">
        {previewUrl && <img src={previewUrl} alt="preview" className="max-w-full max-h-[70vh] mx-auto rounded-lg" />}
      </Modal>

      <Modal
        open={showImagebedModal}
        onClose={() => setShowImagebedModal(false)}
        title={t('images.imagebedSettings')}
        width="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowImagebedModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveImagebed}>{t('common.save')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('images.currentImagebeds')}</h3>
            {imagebeds.length === 0 ? (
              <p className="text-sm text-[var(--color-text-tertiary)]">{t('common.noData')}</p>
            ) : (
              <div className="space-y-2">
                {imagebeds.map((ib) => (
                  <div key={ib.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ib.name}</span>
                      <Badge variant="info">{ib.method}</Badge>
                      {ib.is_default && <Badge variant="success">{t('images.default')}</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      {!ib.is_default && (
                        <Button variant="ghost" size="sm" onClick={() => setDefaultImagebed(ib.id)}>
                          {t('images.setDefault')}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openImagebedModal(ib.id)}>{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => { deleteImagebed(ib.id); toast.success(t('common.deleteSuccess')) }}>
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            <h3 className="text-sm font-semibold mb-3">
              {editingImagebed ? t('images.editImagebed') : t('images.addImagebed')}
            </h3>
            <div className="space-y-3">
              <Input
                label={t('images.name')}
                value={imagebedForm.name}
                onChange={(e) => setImagebedForm({ ...imagebedForm, name: e.target.value })}
              />
              <Select
                label={t('images.method')}
                value={imagebedForm.method}
                onChange={(e) => setImagebedForm({ ...imagebedForm, method: e.target.value })}
                options={[
                  { value: 'local', label: t('images.local') },
                  { value: 'aliyun', label: 'Aliyun OSS' },
                  { value: 'tencent', label: 'Tencent COS' },
                  { value: 'qiniu', label: 'Qiniu' },
                  { value: 'github', label: 'GitHub' },
                  { value: 's3', label: 'AWS S3' },
                  { value: 'custom', label: t('images.custom') },
                ]}
              />
              <Input
                label={t('images.config')}
                value={imagebedForm.configJson}
                onChange={(e) => setImagebedForm({ ...imagebedForm, configJson: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
