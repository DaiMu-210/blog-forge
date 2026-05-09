import { create } from 'zustand'
import type { SiteConfigEntry, CustomPage } from '../types'
import { api } from '../api'

interface ConfigState {
  siteConfig: SiteConfigEntry[]
  customPages: CustomPage[]
  loading: boolean

  fetchSiteConfig: () => Promise<void>
  updateSiteConfig: (entries: SiteConfigEntry[]) => Promise<void>

  fetchCustomPages: () => Promise<void>
  createCustomPage: (title: string, slug: string, content: string, layout: string) => Promise<void>
  updateCustomPage: (id: number, title: string, slug: string, content: string, layout: string, isPublished: boolean) => Promise<void>
  deleteCustomPage: (id: number) => Promise<void>
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  siteConfig: [],
  customPages: [],
  loading: false,

  fetchSiteConfig: async () => {
    set({ loading: true })
    try {
      const config = await api.config.getSite()
      set({ siteConfig: config })
    } finally {
      set({ loading: false })
    }
  },

  updateSiteConfig: async (entries) => {
    await api.config.update(entries)
    set({ siteConfig: entries })
  },

  fetchCustomPages: async () => {
    const pages = await api.customPage.list()
    set({ customPages: pages })
  },

  createCustomPage: async (title, slug, content, layout) => {
    await api.customPage.create(title, slug, content, layout)
    await get().fetchCustomPages()
  },

  updateCustomPage: async (id, title, slug, content, layout, isPublished) => {
    await api.customPage.update(id, title, slug, content, layout, isPublished)
    await get().fetchCustomPages()
  },

  deleteCustomPage: async (id) => {
    await api.customPage.delete(id)
    await get().fetchCustomPages()
  },
}))
