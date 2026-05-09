import { create } from 'zustand'
import type { Image, ImagebedConfig } from '../types'
import { api } from '../api'

interface ImageState {
  images: Image[]
  imagebeds: ImagebedConfig[]
  loading: boolean

  fetchImages: (imagebedId?: number) => Promise<void>
  uploadImage: (filePath: string, imagebedId?: number) => Promise<void>
  deleteImage: (id: number) => Promise<void>

  fetchImagebeds: () => Promise<void>
  createImagebed: (name: string, method: string, configJson: string) => Promise<void>
  updateImagebed: (id: number, name: string, method: string, configJson: string) => Promise<void>
  deleteImagebed: (id: number) => Promise<void>
  testImagebed: (id: number) => Promise<boolean>
  setDefaultImagebed: (id: number) => Promise<void>
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  imagebeds: [],
  loading: false,

  fetchImages: async (imagebedId?) => {
    set({ loading: true })
    try {
      const images = await api.image.list(imagebedId)
      set({ images })
    } finally {
      set({ loading: false })
    }
  },

  uploadImage: async (filePath, imagebedId?) => {
    await api.image.upload(filePath, imagebedId)
    await get().fetchImages()
  },

  deleteImage: async (id) => {
    await api.image.delete(id)
    await get().fetchImages()
  },

  fetchImagebeds: async () => {
    const imagebeds = await api.imagebed.list()
    set({ imagebeds })
  },

  createImagebed: async (name, method, configJson) => {
    await api.imagebed.create(name, method, configJson)
    await get().fetchImagebeds()
  },

  updateImagebed: async (id, name, method, configJson) => {
    await api.imagebed.update(id, name, method, configJson)
    await get().fetchImagebeds()
  },

  deleteImagebed: async (id) => {
    await api.imagebed.delete(id)
    await get().fetchImagebeds()
  },

  testImagebed: async (id) => {
    return api.imagebed.test(id)
  },

  setDefaultImagebed: async (id) => {
    await api.imagebed.setDefault(id)
    await get().fetchImagebeds()
  },
}))
