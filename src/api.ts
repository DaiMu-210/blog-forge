import { invoke as tauriInvoke } from '@tauri-apps/api/core'
import type {
  Article,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQuery,
  Tag,
  Category,
  ArticleVersion,
  Image,
  ImagebedConfig,
  SiteConfigEntry,
  DeployConfig,
  DeployLog,
  CustomPage,
} from './types'

function checkTauri() {
  if (!(window as any).__TAURI_INTERNALS__) {
    throw new Error('不在 Tauri 环境中，请使用 `npx tauri dev` 启动应用')
  }
}

function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  checkTauri()
  return tauriInvoke<T>(cmd, args)
}

export const api = {
  article: {
    create: (dto: CreateArticleDto) => invoke<Article>('create_article', { dto }),
    update: (id: number, dto: UpdateArticleDto, saveVersion: boolean) =>
      invoke<Article>('update_article', { id, dto, saveVersion }),
    delete: (id: number, soft: boolean) => invoke<void>('delete_article', { id, soft }),
    get: (id: number) => invoke<Article>('get_article', { id }),
    list: (query: ArticleQuery) =>
      invoke<{ data: Article[]; total: number }>('list_articles', { query }),
    search: (keyword: string) => invoke<Article[]>('search_articles', { keyword }),
    publish: (id: number) => invoke<Article>('publish_article', { id }),
    unpublish: (id: number) => invoke<Article>('unpublish_article', { id }),
    getVersions: (articleId: number) => invoke<ArticleVersion[]>('get_article_versions', { articleId }),
    restoreVersion: (articleId: number, versionId: number) =>
      invoke<Article>('restore_version', { articleId, versionId }),
    preview: (id: number) => invoke<string>('preview_article', { id }),
  },

  tag: {
    create: (name: string, slug: string, color: string) => invoke<Tag>('create_tag', { name, slug, color }),
    update: (id: number, name: string, slug: string, color: string) =>
      invoke<Tag>('update_tag', { id, name, slug, color }),
    delete: (id: number) => invoke<void>('delete_tag', { id }),
    list: () => invoke<Tag[]>('list_tags'),
  },

  category: {
    create: (name: string, slug: string, parentId: number | null, sortOrder: number) =>
      invoke<Category>('create_category', { name, slug, parentId, sortOrder }),
    update: (id: number, name: string, slug: string, parentId: number | null, sortOrder: number) =>
      invoke<Category>('update_category', { id, name, slug, parentId, sortOrder }),
    delete: (id: number) => invoke<void>('delete_category', { id }),
    list: () => invoke<Category[]>('list_categories'),
  },

  image: {
    upload: (filePath: string, imagebedId?: number) =>
      invoke<Image>('upload_image', { filePath, imagebedId }),
    delete: (id: number) => invoke<void>('delete_image', { id }),
    list: (imagebedId?: number) => invoke<Image[]>('list_images', { imagebedId }),
  },

  imagebed: {
    create: (name: string, method: string, configJson: string) =>
      invoke<ImagebedConfig>('create_imagebed', { name, method, configJson }),
    update: (id: number, name: string, method: string, configJson: string) =>
      invoke<ImagebedConfig>('update_imagebed', { id, name, method, configJson }),
    delete: (id: number) => invoke<void>('delete_imagebed', { id }),
    list: () => invoke<ImagebedConfig[]>('list_imagebeds'),
    test: (id: number) => invoke<boolean>('test_imagebed', { id }),
    setDefault: (id: number) => invoke<void>('set_default_imagebed', { id }),
  },

  config: {
    getSite: () => invoke<SiteConfigEntry[]>('get_site_config'),
    update: (entries: SiteConfigEntry[]) => invoke<void>('update_site_config', { entries }),
  },

  deploy: {
    generate: (outputPath: string) =>
      invoke<{ success: boolean; output_path: string; files_count: number }>('generate_site', {
        outputPath,
      }),
    previewSite: () => invoke<{ url: string; files_count: number }>('preview_site'),
    deploy: (configId: number | null, outputPath: string) =>
      invoke<{ success: boolean; output_path: string }>('deploy_site', { configId, outputPath }),
    createConfig: (name: string, method: string, configJson: string) =>
      invoke<DeployConfig>('create_deploy_config', { name, method, configJson }),
    updateConfig: (id: number, name: string, method: string, configJson: string, isDefault: boolean) =>
      invoke<DeployConfig>('update_deploy_config', { id, name, method, configJson, isDefault }),
    deleteConfig: (id: number) => invoke<void>('delete_deploy_config', { id }),
    listConfigs: () => invoke<DeployConfig[]>('list_deploy_configs'),
    getLogs: (limit?: number) => invoke<DeployLog[]>('get_deploy_logs', { limit }),
  },

  customPage: {
    create: (title: string, slug: string, content: string, layout: string) =>
      invoke<CustomPage>('create_custom_page', { title, slug, content, layout }),
    update: (id: number, title: string, slug: string, content: string, layout: string, isPublished: boolean) =>
      invoke<CustomPage>('update_custom_page', { id, title, slug, content, layout, isPublished }),
    delete: (id: number) => invoke<void>('delete_custom_page', { id }),
    list: () => invoke<CustomPage[]>('list_custom_pages'),
  },
}
