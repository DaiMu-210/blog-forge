use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Article {
    pub id: i64,
    pub title: String,
    pub slug: String,
    pub content: Option<String>,
    pub excerpt: Option<String>,
    pub status: ArticleStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub published_at: Option<DateTime<Utc>>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub meta_keywords: Option<String>,
    pub is_top: bool,
    pub view_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ArticleStatus {
    Draft,
    Published,
    Trash,
}

impl ArticleStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ArticleStatus::Draft => "draft",
            ArticleStatus::Published => "published",
            ArticleStatus::Trash => "trash",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "published" => ArticleStatus::Published,
            "trash" => ArticleStatus::Trash,
            _ => ArticleStatus::Draft,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateArticleDto {
    pub title: String,
    pub content: Option<String>,
    pub excerpt: Option<String>,
    pub status: Option<ArticleStatus>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub meta_keywords: Option<String>,
    pub is_top: Option<bool>,
    pub tags: Option<Vec<String>>,
    pub category_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateArticleDto {
    pub title: Option<String>,
    pub content: Option<String>,
    pub excerpt: Option<String>,
    pub status: Option<ArticleStatus>,
    pub cover_image: Option<String>,
    pub meta_title: Option<String>,
    pub meta_description: Option<String>,
    pub meta_keywords: Option<String>,
    pub is_top: Option<bool>,
    pub tags: Option<Vec<String>>,
    pub category_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArticleQuery {
    pub status: Option<String>,
    pub tag: Option<String>,
    pub category: Option<i64>,
    pub keyword: Option<String>,
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub order_by: Option<String>,
    pub order_dir: Option<String>,
}

impl Default for ArticleQuery {
    fn default() -> Self {
        Self {
            status: None,
            tag: None,
            category: None,
            keyword: None,
            page: Some(1),
            page_size: Some(20),
            order_by: Some("created_at".to_string()),
            order_dir: Some("desc".to_string()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArticleVersion {
    pub id: i64,
    pub article_id: i64,
    pub title: String,
    pub content: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: i64,
    pub name: String,
    pub slug: String,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTagDto {
    pub name: String,
    pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub slug: String,
    pub parent_id: Option<i64>,
    pub sort_order: i64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCategoryDto {
    pub name: String,
    pub parent_id: Option<i64>,
    pub sort_order: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Image {
    pub id: i64,
    pub filename: String,
    pub storage_key: String,
    pub url: String,
    pub imagebed_id: Option<i64>,
    pub size: i64,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub mime_type: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagebedConfig {
    pub id: i64,
    pub name: String,
    pub config_type: String,
    pub config: serde_json::Value,
    pub is_default: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteConfig {
    pub site_name: Option<String>,
    pub site_description: Option<String>,
    pub site_author: Option<String>,
    pub site_url: Option<String>,
    pub theme: Option<String>,
    pub language: Option<String>,
    pub dark_mode: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArticleListResponse {
    pub articles: Vec<Article>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}
