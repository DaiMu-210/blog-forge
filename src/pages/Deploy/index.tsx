import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Rocket, FileUp, Server, Plus, Trash2, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useDeployStore } from '../../stores/deployStore'
import { useToast } from '../../components/common/Toast'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Modal } from '../../components/common/Modal'
import { Input } from '../../components/common/Input'
import { Select } from '../../components/common/Select'
import { Badge } from '../../components/common/Badge'
import { Table, type Column } from '../../components/common/Table'
import type { DeployConfig, DeployLog } from '../../types'

export default function Deploy() {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    configs, logs, deploying, lastDeployResult,
    fetchConfigs, createConfig, updateConfig, deleteConfig,
    fetchLogs, deploy, generate,
  } = useDeployStore()

  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<DeployConfig | null>(null)
  const [deployForm, setDeployForm] = useState({ name: '', method: 'local', configJson: '{}' })
  const [cosForm, setCosForm] = useState({ secret_id: '', secret_key: '', region: '', bucket: '', prefix: '' })

  useEffect(() => {
    fetchConfigs()
    fetchLogs()
  }, [])

  const parseCosConfig = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      return {
        secret_id: parsed.secret_id || '',
        secret_key: parsed.secret_key || '',
        region: parsed.region || '',
        bucket: parsed.bucket || '',
        prefix: parsed.prefix || '',
      }
    } catch {
      return { secret_id: '', secret_key: '', region: '', bucket: '', prefix: '' }
    }
  }

  const openConfigModal = (config?: DeployConfig) => {
    if (config) {
      setDeployForm({ name: config.name, method: config.method, configJson: config.config })
      setCosForm(parseCosConfig(config.config))
      setEditingConfig(config)
    } else {
      setDeployForm({ name: '', method: 'local', configJson: '{}' })
      setCosForm({ secret_id: '', secret_key: '', region: '', bucket: '', prefix: '' })
      setEditingConfig(null)
    }
    setShowConfigModal(true)
  }

  const handleCosFormChange = (field: string, value: string) => {
    const updated = { ...cosForm, [field]: value }
    setCosForm(updated)
    setDeployForm({
      ...deployForm,
      configJson: JSON.stringify(updated),
    })
  }

  const handleMethodChange = (method: string) => {
    const baseConfig = method === 'cos'
      ? JSON.stringify(cosForm)
      : '{}'
    setDeployForm({ ...deployForm, method, configJson: baseConfig })
  }

  const handleSaveConfig = async () => {
    if (!deployForm.name.trim()) {
      toast.error(t('deploy.nameRequired'))
      return
    }
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, deployForm.name, deployForm.method, deployForm.configJson, editingConfig.is_default)
        toast.success(t('common.updateSuccess'))
      } else {
        await createConfig(deployForm.name, deployForm.method, deployForm.configJson)
        toast.success(t('common.createSuccess'))
      }
      setShowConfigModal(false)
    } catch {
      toast.error(t('common.saveError'))
    }
  }

  const handleDeleteConfig = async (id: number) => {
    try {
      await deleteConfig(id)
      toast.success(t('common.deleteSuccess'))
    } catch {
      toast.error(t('common.deleteError'))
    }
  }

  const handleGenerate = async () => {
    try {
      await generate('')
      toast.success(t('deploy.generateSuccess'))
    } catch {
      toast.error(t('deploy.generateError'))
    }
  }

  const handleDeploy = async (configId: number) => {
    try {
      await deploy(configId, '')
      fetchLogs()
      if (lastDeployResult?.success) {
        toast.success(t('deploy.deploySuccess'))
      } else {
        toast.error(t('deploy.deployError'))
      }
      fetchLogs()
    } catch {
      toast.error(t('deploy.deployError'))
    }
  }

  const logColumns: Column<DeployLog>[] = [
    {
      key: 'status', title: t('deploy.status'), width: '12%',
      render: (_, record) => (
        record.status === 'success'
          ? <CheckCircle size={16} className="text-[var(--color-success)]" />
          : <XCircle size={16} className="text-[var(--color-error)]" />
      ),
    },
    {
      key: 'config_id', title: t('deploy.configName'), width: '15%',
      render: (_, record) => <span className="text-sm">{String(record.config_id)}</span>,
    },
    {
      key: 'message', title: t('deploy.message'), width: '43%',
      render: (_, record) => <span className="text-xs text-[var(--color-text-secondary)]">{record.message}</span>,
    },
    {
      key: 'created_at', title: t('deploy.time'), width: '30%',
      render: (_, record) => (
        <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
          <Clock size={12} />
          {new Date(record.created_at).toLocaleString()}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{t('nav.deploy')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerate}>
            <FileUp size={14} className="mr-2" />
            {t('deploy.generate')}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('deploy.configs')}</h2>
            <Button size="sm" onClick={() => openConfigModal()}>
              <Plus size={14} className="mr-1" />
              {t('common.create')}
            </Button>
          </div>

          {configs.length === 0 ? (
            <Card className="py-12 text-center text-[var(--color-text-tertiary)]">
              <Server size={40} className="mx-auto mb-3 opacity-30" />
              <p>{t('deploy.noConfigs')}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <Card key={config.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{config.name}</h3>
                      {config.is_default && <Badge variant="info">{t('images.default')}</Badge>}
                      <Badge variant="default">{config.method}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openConfigModal(config)}>{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(config.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDeploy(config.id)}
                    loading={deploying}
                  >
                    <Rocket size={14} className="mr-1" />
                    {t('deploy.deploy')}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('deploy.logs')}</h2>
            <Button variant="ghost" size="sm" onClick={() => fetchLogs()}>
              <RefreshCw size={14} className="mr-1" /> {t('common.refresh')}
            </Button>
          </div>

          <Table
            columns={logColumns}
            dataSource={logs}
            rowKey="id"
            loading={false}
            emptyText={t('deploy.noLogs')}
          />
        </div>
      </div>

      <Modal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={editingConfig ? t('common.edit') : t('deploy.addConfig')}
        width="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveConfig}>{t('common.save')}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('deploy.name')}
            value={deployForm.name}
            onChange={(e) => setDeployForm({ ...deployForm, name: e.target.value })}
            placeholder={t('deploy.namePlaceholder')}
          />
          <Select
            label={t('deploy.method')}
            value={deployForm.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            options={[
              { value: 'local', label: t('deploy.local') },
              { value: 'ftp', label: 'FTP' },
              { value: 'r2', label: 'Cloudflare R2' },
              { value: 'cos', label: t('deploy.cos') },
              { value: 'github', label: 'GitHub Pages' },
              { value: 'custom', label: t('deploy.custom') },
            ]}
          />
          {deployForm.method === 'cos' ? (
            <div className="space-y-3">
              <Input
                label={t('deploy.cosSecretId')}
                value={cosForm.secret_id}
                onChange={(e) => handleCosFormChange('secret_id', e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">{t('deploy.cosSecretKey')}</label>
                <input
                  type="password"
                  className="w-full rounded-lg border bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-9 text-sm px-3"
                  value={cosForm.secret_key}
                  onChange={(e) => handleCosFormChange('secret_key', e.target.value)}
                />
              </div>
              <Input
                label={t('deploy.cosRegion')}
                placeholder={t('deploy.cosRegionPlaceholder')}
                value={cosForm.region}
                onChange={(e) => handleCosFormChange('region', e.target.value)}
              />
              <Input
                label={t('deploy.cosBucket')}
                placeholder={t('deploy.cosBucketPlaceholder')}
                value={cosForm.bucket}
                onChange={(e) => handleCosFormChange('bucket', e.target.value)}
              />
              <Input
                label={t('deploy.cosPrefix')}
                placeholder={t('deploy.cosPrefixPlaceholder')}
                value={cosForm.prefix}
                onChange={(e) => handleCosFormChange('prefix', e.target.value)}
              />
            </div>
          ) : (
            <Input
              label={t('deploy.config')}
              value={deployForm.configJson}
              onChange={(e) => setDeployForm({ ...deployForm, configJson: e.target.value })}
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
