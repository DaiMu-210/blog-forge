export interface Article {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'trash';
  created_at: string;
  updated_at: string;
  published_at?: string;
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_top: boolean;
  view_count: number;
}

export interface CreateArticleDto {
  title: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'trash';
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_top?: boolean;
  tags?: string[];
  category_id?: number;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'trash';
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_top?: boolean;
  tags?: string[];
  category_id?: number;
}

export interface ArticleQuery {
  status?: string;
  tag?: string;
  category?: number;
  keyword?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_dir?: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ArticleVersion {
  id: number;
  article_id: number;
  title: string;
  content?: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  created_at: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  sort_order: number;
  created_at: string;
}

export interface CreateCategoryDto {
  name: string;
  parent_id?: number;
  sort_order?: number;
}
