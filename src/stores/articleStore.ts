import { create } from 'zustand'
import type { Article, CreateArticleDto, UpdateArticleDto, ArticleQuery, ArticleVersion, Tag, Category } from '../types'
import { api } from '../api'

interface ArticleState {
  articles: Article[]
  currentArticle: Article | null
  versions: ArticleVersion[]
  tags: Tag[]
  categories: Category[]
  total: number
  loading: boolean
  query: ArticleQuery

  fetchArticles: (query?: ArticleQuery) => Promise<void>
  fetchArticle: (id: number) => Promise<void>
  createArticle: (dto: CreateArticleDto) => Promise<Article>
  updateArticle: (id: number, dto: UpdateArticleDto, saveVersion?: boolean) => Promise<Article>
  deleteArticle: (id: number, soft?: boolean) => Promise<void>
  restoreArticle: (id: number) => Promise<void>
  publishArticle: (id: number) => Promise<void>
  unpublishArticle: (id: number) => Promise<void>
  searchArticles: (keyword: string) => Promise<Article[]>
  fetchVersions: (articleId: number) => Promise<void>
  restoreVersion: (articleId: number, versionId: number) => Promise<void>

  fetchTags: () => Promise<void>
  createTag: (name: string, slug: string, color: string) => Promise<void>
  updateTag: (id: number, name: string, slug: string, color: string) => Promise<void>
  deleteTag: (id: number) => Promise<void>

  fetchCategories: () => Promise<void>
  createCategory: (name: string, slug: string, parentId: number | null, sortOrder: number) => Promise<void>
  updateCategory: (id: number, name: string, slug: string, parentId: number | null, sortOrder: number) => Promise<void>
  deleteCategory: (id: number) => Promise<void>

  setQuery: (query: Partial<ArticleQuery>) => void
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  currentArticle: null,
  versions: [],
  tags: [],
  categories: [],
  total: 0,
  loading: false,
  query: { page: 1, page_size: 20, sort_by: 'created_at', sort_order: 'desc' },

  fetchArticles: async (query) => {
    set({ loading: true })
    try {
      const q = query || get().query
      const result = await api.article.list(q)
      set({ articles: result.data, total: result.total, query: q })
    } finally {
      set({ loading: false })
    }
  },

  fetchArticle: async (id) => {
    const article = await api.article.get(id)
    set({ currentArticle: article })
  },

  createArticle: async (dto) => {
    const article = await api.article.create(dto)
    await get().fetchArticles()
    return article
  },

  updateArticle: async (id, dto, saveVersion = true) => {
    const article = await api.article.update(id, dto, saveVersion)
    set({ currentArticle: article })
    await get().fetchArticles()
    return article
  },

  deleteArticle: async (id, soft = true) => {
    await api.article.delete(id, soft)
    await get().fetchArticles()
    if (get().currentArticle?.id === id) set({ currentArticle: null })
  },

  restoreArticle: async (id) => {
    await api.article.update(id, { status: 'draft' } as UpdateArticleDto, false)
    await get().fetchArticles()
  },

  publishArticle: async (id) => {
    await api.article.publish(id)
    await get().fetchArticles()
  },

  unpublishArticle: async (id) => {
    await api.article.unpublish(id)
    await get().fetchArticles()
  },

  searchArticles: async (keyword) => {
    const articles = await api.article.search(keyword)
    return articles
  },

  fetchVersions: async (articleId) => {
    const versions = await api.article.getVersions(articleId)
    set({ versions })
  },

  restoreVersion: async (articleId, versionId) => {
    const article = await api.article.restoreVersion(articleId, versionId)
    set({ currentArticle: article })
    await get().fetchArticles()
  },

  fetchTags: async () => {
    const tags = await api.tag.list()
    set({ tags })
  },

  createTag: async (name, slug, color) => {
    await api.tag.create(name, slug, color)
    await get().fetchTags()
  },

  updateTag: async (id, name, slug, color) => {
    await api.tag.update(id, name, slug, color)
    await get().fetchTags()
  },

  deleteTag: async (id) => {
    await api.tag.delete(id)
    await get().fetchTags()
  },

  fetchCategories: async () => {
    const categories = await api.category.list()
    set({ categories })
  },

  createCategory: async (name, slug, parentId, sortOrder) => {
    await api.category.create(name, slug, parentId, sortOrder)
    await get().fetchCategories()
  },

  updateCategory: async (id, name, slug, parentId, sortOrder) => {
    await api.category.update(id, name, slug, parentId, sortOrder)
    await get().fetchCategories()
  },

  deleteCategory: async (id) => {
    await api.category.delete(id)
    await get().fetchCategories()
  },

  setQuery: (query) => {
    set((state) => ({ query: { ...state.query, ...query } }))
  },
}))
