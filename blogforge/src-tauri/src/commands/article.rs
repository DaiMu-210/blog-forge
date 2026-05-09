use tauri::command;

use crate::error::AppError;
use crate::models::{
    Article, ArticleListResponse, ArticleQuery, ArticleVersion, CreateArticleDto, UpdateArticleDto,
};
use crate::services::ArticleService;

#[command]
pub async fn create_article(dto: CreateArticleDto) -> Result<Article, String> {
    ArticleService::create_article(dto).map_err(|e| e.to_string())
}

#[command]
pub async fn update_article(id: i64, dto: UpdateArticleDto) -> Result<Article, String> {
    ArticleService::update_article(id, dto).map_err(|e| e.to_string())
}

#[command]
pub async fn delete_article(id: i64) -> Result<(), String> {
    ArticleService::delete_article(id).map_err(|e| e.to_string())
}

#[command]
pub async fn get_article(id: i64) -> Result<Article, String> {
    ArticleService::get_article(id).map_err(|e| e.to_string())
}

#[command]
pub async fn list_articles(query: Option<ArticleQuery>) -> Result<ArticleListResponse, String> {
    ArticleService::list_articles(query.unwrap_or_default()).map_err(|e| e.to_string())
}

#[command]
pub async fn search_articles(keyword: String) -> Result<Vec<Article>, String> {
    ArticleService::search_articles(keyword).map_err(|e| e.to_string())
}

#[command]
pub async fn publish_article(id: i64) -> Result<Article, String> {
    ArticleService::publish_article(id).map_err(|e| e.to_string())
}

#[command]
pub async fn unpublish_article(id: i64) -> Result<Article, String> {
    ArticleService::unpublish_article(id).map_err(|e| e.to_string())
}

#[command]
pub async fn get_article_versions(article_id: i64) -> Result<Vec<ArticleVersion>, String> {
    ArticleService::get_versions(article_id).map_err(|e| e.to_string())
}

#[command]
pub async fn restore_article_version(article_id: i64, version_id: i64) -> Result<Article, String> {
    ArticleService::restore_version(article_id, version_id).map_err(|e| e.to_string())
}
