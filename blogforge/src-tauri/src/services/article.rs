use chrono::Utc;
use log::info;
use rusqlite::params;
use slug::slugify;

use crate::database::get_connection;
use crate::error::AppError;
use crate::models::{
    Article, ArticleListResponse, ArticleQuery, ArticleStatus, ArticleVersion,
    CreateArticleDto, UpdateArticleDto,
};

pub struct ArticleService;

impl ArticleService {
    pub fn create_article(dto: CreateArticleDto) -> Result<Article, AppError> {
        let conn = get_connection()?;
        let slug = Self::generate_slug(&dto.title);

        let now = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        conn.execute(
            "INSERT INTO articles (title, slug, content, excerpt, status, created_at, updated_at,
             cover_image, meta_title, meta_description, meta_keywords, is_top)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                dto.title,
                slug,
                dto.content,
                dto.excerpt,
                dto.status.as_ref().unwrap_or(&ArticleStatus::Draft).as_str(),
                now.clone(),
                now,
                dto.cover_image,
                dto.meta_title,
                dto.meta_description,
                dto.meta_keywords,
                dto.is_top.unwrap_or(false) as i32
            ],
        )?;

        let id = conn.last_insert_rowid();
        info!("Created article with id: {}", id);

        Self::get_article_by_id(id)
    }

    pub fn update_article(id: i64, dto: UpdateArticleDto) -> Result<Article, AppError> {
        let conn = get_connection()?;

        let existing = Self::get_article_by_id(id)?;

        let title = dto.title.clone().unwrap_or(existing.title.clone());
        let slug = if dto.title.is_some() {
            Self::generate_slug(&title)
        } else {
            existing.slug.clone()
        };

        let now = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let published_at = if dto.status.as_ref() == Some(&ArticleStatus::Published)
            && existing.status != ArticleStatus::Published
        {
            Some(now.clone())
        } else {
            existing.published_at.map(|_| now.clone())
        };

        if let Some(ref content) = dto.content {
            if content != existing.content.as_ref().unwrap_or(&String::new()) {
                Self::save_version(&conn, id, &existing.title, &existing.content)?;
            }
        }

        conn.execute(
            "UPDATE articles SET title = ?1, slug = ?2, content = COALESCE(?3, content),
             excerpt = COALESCE(?4, excerpt), status = COALESCE(?5, status),
             updated_at = ?6, published_at = COALESCE(?7, published_at),
             cover_image = COALESCE(?8, cover_image),
             meta_title = COALESCE(?9, meta_title),
             meta_description = COALESCE(?10, meta_description),
             meta_keywords = COALESCE(?11, meta_keywords),
             is_top = COALESCE(?12, is_top)
             WHERE id = ?13",
            params![
                title,
                slug,
                dto.content,
                dto.excerpt,
                dto.status.as_ref().map(|s| s.as_str()),
                now,
                published_at,
                dto.cover_image,
                dto.meta_title,
                dto.meta_description,
                dto.meta_keywords,
                dto.is_top.map(|v| v as i32),
                id
            ],
        )?;

        info!("Updated article with id: {}", id);
        Self::get_article_by_id(id)
    }

    pub fn delete_article(id: i64) -> Result<(), AppError> {
        let conn = get_connection()?;
        conn.execute("DELETE FROM articles WHERE id = ?1", params![id])?;
        info!("Deleted article with id: {}", id);
        Ok(())
    }

    pub fn get_article(id: i64) -> Result<Article, AppError> {
        Self::get_article_by_id(id)
    }

    pub fn list_articles(query: ArticleQuery) -> Result<ArticleListResponse, AppError> {
        let conn = get_connection()?;
        let page = query.page.unwrap_or(1);
        let page_size = query.page_size.unwrap_or(20);
        let offset = (page - 1) * page_size;

        let mut sql = String::from("SELECT DISTINCT a.id FROM articles a");
        let mut count_sql = String::from("SELECT COUNT(DISTINCT a.id) FROM articles a");
        let mut conditions = Vec::new();

        if query.tag.is_some() {
            sql.push_str(" JOIN article_tags at ON a.id = at.article_id JOIN tags t ON at.tag_id = t.id");
            count_sql.push_str(" JOIN article_tags at ON a.id = at.article_id JOIN tags t ON at.tag_id = t.id");
            conditions.push("t.slug = ?");
        }

        if query.category.is_some() {
            sql.push_str(" JOIN article_categories ac ON a.id = ac.article_id");
            count_sql.push_str(" JOIN article_categories ac ON a.id = ac.article_id");
            conditions.push("ac.category_id = ?");
        }

        if query.status.is_some() {
            conditions.push("a.status = ?");
        }

        if query.keyword.is_some() {
            conditions.push("(a.title LIKE ? OR a.content LIKE ?)");
        }

        if !conditions.is_empty() {
            let where_clause = format!(" WHERE {}", conditions.join(" AND "));
            sql.push_str(&where_clause);
            count_sql.push_str(&where_clause);
        }

        let order_by = query.order_by.unwrap_or_else(|| "created_at".to_string());
        let order_dir = query.order_dir.unwrap_or_else(|| "desc".to_string());
        sql.push_str(&format!(" ORDER BY a.{} {}", order_by, order_dir));
        sql.push_str(&format!(" LIMIT {} OFFSET {}", page_size, offset));

        let mut stmt = conn.prepare(&sql)?;

        let ids: Vec<i64> = stmt
            .query_map([], |row| row.get(0))?
            .filter_map(|r| r.ok())
            .collect();

        let mut articles = Vec::new();
        for id in ids {
            if let Ok(article) = Self::get_article_by_id(id) {
                articles.push(article);
            }
        }

        let total = articles.len() as i64;
        let total_pages = (total as f64 / page_size as f64).ceil() as i64;

        Ok(ArticleListResponse {
            articles,
            total,
            page,
            page_size,
            total_pages,
        })
    }

    pub fn search_articles(keyword: String) -> Result<Vec<Article>, AppError> {
        let conn = get_connection()?;
        let kw = format!("%{}%", keyword);
        let mut stmt = conn.prepare(
            "SELECT id FROM articles WHERE title LIKE ?1 OR content LIKE ?1 LIMIT 50",
        )?;

        let ids: Vec<i64> = stmt
            .query_map([&kw], |row| row.get(0))?
            .filter_map(|r| r.ok())
            .collect();

        let mut articles = Vec::new();
        for id in ids {
            if let Ok(article) = Self::get_article_by_id(id) {
                articles.push(article);
            }
        }
        Ok(articles)
    }

    pub fn publish_article(id: i64) -> Result<Article, AppError> {
        Self::update_article(id, UpdateArticleDto {
            status: Some(ArticleStatus::Published),
            ..Default::default()
        })
    }

    pub fn unpublish_article(id: i64) -> Result<Article, AppError> {
        Self::update_article(id, UpdateArticleDto {
            status: Some(ArticleStatus::Draft),
            ..Default::default()
        })
    }

    pub fn get_versions(article_id: i64) -> Result<Vec<ArticleVersion>, AppError> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, article_id, title, content, created_at FROM article_versions
             WHERE article_id = ?1 ORDER BY created_at DESC LIMIT 20",
        )?;

        let versions = stmt
            .query_map([article_id], |row| {
                let created_at_str: String = row.get(4)?;
                let created_at = chrono::DateTime::parse_from_rfc3339(&format!("{}T00:00:00Z", created_at_str))
                    .map(|dt| dt.with_timezone(&chrono::Utc))
                    .unwrap_or_else(|_| chrono::Utc::now());
                Ok(ArticleVersion {
                    id: row.get(0)?,
                    article_id: row.get(1)?,
                    title: row.get(2)?,
                    content: row.get(3)?,
                    created_at,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(versions)
    }

    pub fn restore_version(article_id: i64, version_id: i64) -> Result<Article, AppError> {
        let conn = get_connection()?;

        let version: ArticleVersion = conn.query_row(
            "SELECT id, article_id, title, content, created_at FROM article_versions WHERE id = ?1",
            [version_id],
            |row| {
                let created_at_str: String = row.get(4)?;
                let created_at = chrono::DateTime::parse_from_rfc3339(&format!("{}T00:00:00Z", created_at_str))
                    .map(|dt| dt.with_timezone(&chrono::Utc))
                    .unwrap_or_else(|_| chrono::Utc::now());
                Ok(ArticleVersion {
                    id: row.get(0)?,
                    article_id: row.get(1)?,
                    title: row.get(2)?,
                    content: row.get(3)?,
                    created_at,
                })
            },
        )?;

        if version.article_id != article_id {
            return Err(AppError::Validation("Version does not belong to this article".to_string()));
        }

        Self::update_article(article_id, UpdateArticleDto {
            title: Some(version.title),
            content: version.content,
            ..Default::default()
        })
    }

    fn get_article_by_id(id: i64) -> Result<Article, AppError> {
        let conn = get_connection()?;
        conn.query_row(
            "SELECT id, title, slug, content, excerpt, status, created_at, updated_at,
             published_at, cover_image, meta_title, meta_description, meta_keywords,
             is_top, view_count FROM articles WHERE id = ?1",
            [id],
            |row| {
                let parse_datetime = |idx: usize| -> chrono::DateTime<chrono::Utc> {
                    row.get::<_, String>(idx)
                        .ok()
                        .and_then(|s| chrono::DateTime::parse_from_rfc3339(&format!("{}T00:00:00Z", s)).ok())
                        .map(|dt| dt.with_timezone(&chrono::Utc))
                        .unwrap_or_else(chrono::Utc::now)
                };
                let parse_opt_datetime = |idx: usize| -> Option<chrono::DateTime<chrono::Utc>> {
                    row.get::<_, String>(idx)
                        .ok()
                        .and_then(|s| chrono::DateTime::parse_from_rfc3339(&format!("{}T00:00:00Z", s)).ok())
                        .map(|dt| dt.with_timezone(&chrono::Utc))
                };
                Ok(Article {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    slug: row.get(2)?,
                    content: row.get(3)?,
                    excerpt: row.get(4)?,
                    status: ArticleStatus::from_str(&row.get::<_, String>(5)?),
                    created_at: parse_datetime(6),
                    updated_at: parse_datetime(7),
                    published_at: parse_opt_datetime(8),
                    cover_image: row.get(9)?,
                    meta_title: row.get(10)?,
                    meta_description: row.get(11)?,
                    meta_keywords: row.get(12)?,
                    is_top: row.get::<_, i32>(13)? != 0,
                    view_count: row.get(14)?,
                })
            },
        ).map_err(|_| AppError::NotFound(format!("Article with id {} not found", id)))
    }

    fn generate_slug(title: &str) -> String {
        let base_slug = slugify(title);
        if base_slug.is_empty() {
            uuid::Uuid::new_v4().to_string()
        } else {
            base_slug
        }
    }

    fn save_version(conn: &rusqlite::Connection, article_id: i64, title: &str, content: &Option<String>) -> Result<(), AppError> {
        conn.execute(
            "INSERT INTO article_versions (article_id, title, content) VALUES (?1, ?2, ?3)",
            params![article_id, title, content],
        )?;

        conn.execute(
            "DELETE FROM article_versions WHERE article_id = ?1
             AND id NOT IN (SELECT id FROM article_versions WHERE article_id = ?1 ORDER BY created_at DESC LIMIT 20)",
            [article_id],
        )?;

        Ok(())
    }
}

impl Default for UpdateArticleDto {
    fn default() -> Self {
        Self {
            title: None,
            content: None,
            excerpt: None,
            status: None,
            cover_image: None,
            meta_title: None,
            meta_description: None,
            meta_keywords: None,
            is_top: None,
            tags: None,
            category_id: None,
        }
    }
}
