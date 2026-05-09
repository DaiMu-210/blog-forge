import { create } from 'zustand'
import type { DeployConfig, DeployLog } from '../types'
import { api } from '../api'

interface DeployState {
  configs: DeployConfig[]
  logs: DeployLog[]
  deploying: boolean
  lastDeployResult: { success: boolean; output_path: string } | null

  fetchConfigs: () => Promise<void>
  createConfig: (name: string, method: string, configJson: string) => Promise<void>
  updateConfig: (id: number, name: string, method: string, configJson: string, isDefault: boolean) => Promise<void>
  deleteConfig: (id: number) => Promise<void>

  fetchLogs: (limit?: number) => Promise<void>
  deploy: (configId: number | null, outputPath: string) => Promise<void>
  generate: (outputPath: string) => Promise<void>
}

export const useDeployStore = create<DeployState>((set, get) => ({
  configs: [],
  logs: [],
  deploying: false,
  lastDeployResult: null,

  fetchConfigs: async () => {
    const configs = await api.deploy.listConfigs()
    set({ configs })
  },

  createConfig: async (name, method, configJson) => {
    await api.deploy.createConfig(name, method, configJson)
    await get().fetchConfigs()
  },

  updateConfig: async (id, name, method, configJson, isDefault) => {
    await api.deploy.updateConfig(id, name, method, configJson, isDefault)
    await get().fetchConfigs()
  },

  deleteConfig: async (id) => {
    await api.deploy.deleteConfig(id)
    await get().fetchConfigs()
  },

  fetchLogs: async (limit?) => {
    const logs = await api.deploy.getLogs(limit)
    set({ logs })
  },

  deploy: async (configId, outputPath) => {
    set({ deploying: true })
    try {
      const result = await api.deploy.deploy(configId, outputPath)
      set({ lastDeployResult: result })
      await get().fetchLogs()
    } finally {
      set({ deploying: false })
    }
  },

  generate: async (outputPath) => {
    set({ deploying: true })
    try {
      const result = await api.deploy.generate(outputPath)
      set({ lastDeployResult: result })
    } finally {
      set({ deploying: false })
    }
  },
}))
