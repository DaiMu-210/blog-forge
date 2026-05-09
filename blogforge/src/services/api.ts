import { invoke } from '@tauri-apps/api/core';
import type {
  Article,
  ArticleListResponse,
  ArticleQuery,
  ArticleVersion,
  CreateArticleDto,
  UpdateArticleDto,
  Tag,
  CreateTagDto,
  Category,
  CreateCategoryDto,
} from '../types';

export const articleApi = {
  create: (dto: CreateArticleDto): Promise<Article> =>
    invoke('create_article', { dto }),

  update: (id: number, dto: UpdateArticleDto): Promise<Article> =>
    invoke('update_article', { id, dto }),

  delete: (id: number): Promise<void> =>
    invoke('delete_article', { id }),

  get: (id: number): Promise<Article> =>
    invoke('get_article', { id }),

  list: (query?: ArticleQuery): Promise<ArticleListResponse> =>
    invoke('list_articles', { query }),

  search: (keyword: string): Promise<Article[]> =>
    invoke('search_articles', { keyword }),

  publish: (id: number): Promise<Article> =>
    invoke('publish_article', { id }),

  unpublish: (id: number): Promise<Article> =>
    invoke('unpublish_article', { id }),

  getVersions: (articleId: number): Promise<ArticleVersion[]> =>
    invoke('get_article_versions', { articleId }),

  restoreVersion: (articleId: number, versionId: number): Promise<Article> =>
    invoke('restore_article_version', { articleId, versionId }),
};

export const tagApi = {
  create: (dto: CreateTagDto): Promise<Tag> =>
    invoke('create_tag', { dto }),

  list: (): Promise<Tag[]> =>
    invoke('list_tags'),

  delete: (id: number): Promise<void> =>
    invoke('delete_tag', { id }),
};

export const categoryApi = {
  create: (dto: CreateCategoryDto): Promise<Category> =>
    invoke('create_category', { dto }),

  list: (): Promise<Category[]> =>
    invoke('list_categories'),

  delete: (id: number): Promise<void> =>
    invoke('delete_category', { id }),
};
