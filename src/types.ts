export interface Article {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'draft' | 'published' | 'trash'
  created_at: string
  updated_at: string
  published_at: string | null
  cover_image: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  is_top: boolean
  view_count: number
  tags: Tag[]
  categories: Category[]
}

export interface CreateArticleDto {
  title: string
  slug?: string
  content?: string
  excerpt?: string
  status?: string
  cover_image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  is_top?: boolean
  category_id?: number
  tag_ids?: number[]
}

export interface UpdateArticleDto {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  status?: string
  cover_image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  is_top?: boolean
  category_id?: number
  tag_ids?: number[]
}

export interface ArticleQuery {
  status?: string
  category_id?: number
  tag_id?: number
  keyword?: string
  sort_by?: string
  sort_order?: string
  page?: number
  page_size?: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  color: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  sort_order: number
  created_at: string
}

export interface ArticleVersion {
  id: number
  article_id: number
  title: string
  content: string
  created_at: string
}

export interface Image {
  id: number
  filename: string
  storage_key: string
  url: string
  imagebed_id: number | null
  size: number
  width: number
  height: number
  mime_type: string
  created_at: string
}

export interface ImagebedConfig {
  id: number
  name: string
  method: string
  config: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface SiteConfigEntry {
  key: string
  value: string
}

export interface DeployConfig {
  id: number
  name: string
  method: string
  config: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface DeployLog {
  id: number
  config_id: number | null
  status: string
  message: string
  files_count: number
  duration_ms: number
  created_at: string
}

export interface CustomPage {
  id: number
  title: string
  slug: string
  content: string
  layout: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_articles: number
  published_articles: number
  draft_articles: number
  trash_articles: number
  total_categories: number
  total_tags: number
  recent_articles: Article[]
}
