use crate::database::DbState;
use crate::generator;
use crate::models::*;
use crate::services;

use tauri::State;

#[tauri::command]
pub fn create_article(state: State<'_, DbState>, dto: CreateArticleDto) -> Result<Article, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::create_article(&db, dto).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_article(state: State<'_, DbState>, id: i64, dto: UpdateArticleDto, save_version: bool) -> Result<Article, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::update_article(&db, id, dto, save_version).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_article(state: State<'_, DbState>, id: i64, soft: bool) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::delete_article(&db, id, soft).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_article(state: State<'_, DbState>, id: i64) -> Result<Article, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::get_article(&db, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_articles(state: State<'_, DbState>, query: ArticleQuery) -> Result<serde_json::Value, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let (articles, total) = services::article::list_articles(&db, query).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "data": articles, "total": total }))
}

#[tauri::command]
pub fn search_articles(state: State<'_, DbState>, keyword: String) -> Result<Vec<Article>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::search_articles(&db, &keyword).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn publish_article(state: State<'_, DbState>, id: i64) -> Result<Article, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let dto = UpdateArticleDto {
        status: Some("published".to_string()),
        ..Default::default()
    };
    services::article::update_article(&db, id, dto, false).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn unpublish_article(state: State<'_, DbState>, id: i64) -> Result<Article, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let dto = UpdateArticleDto {
        status: Some("draft".to_string()),
        ..Default::default()
    };
    services::article::update_article(&db, id, dto, false).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_article_versions(state: State<'_, DbState>, article_id: i64) -> Result<Vec<ArticleVersion>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::get_article_versions(&db, article_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn restore_version(state: State<'_, DbState>, article_id: i64, version_id: i64) -> Result<Article, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::article::restore_version(&db, article_id, version_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn preview_article(state: State<'_, DbState>, id: i64) -> Result<String, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let article = services::article::get_article(&db, id).map_err(|e| e.to_string())?;
    let configs = services::config::get_site_config(&db).map_err(|e| e.to_string())?;
    let html = generator::generate_article_preview(&article, &configs).map_err(|e| e.to_string())?;
    Ok(html)
}

#[tauri::command]
pub fn create_tag(state: State<'_, DbState>, name: String, slug: String, color: String) -> Result<Tag, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::tag::create_tag(&db, &name, &slug, &color).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_tag(state: State<'_, DbState>, id: i64, name: String, slug: String, color: String) -> Result<Tag, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::tag::update_tag(&db, id, &name, &slug, &color).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_tag(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::tag::delete_tag(&db, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_tags(state: State<'_, DbState>) -> Result<Vec<Tag>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::tag::list_tags(&db).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_category(state: State<'_, DbState>, name: String, slug: String, parent_id: Option<i64>, sort_order: i32) -> Result<Category, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::category::create_category(&db, &name, &slug, parent_id, sort_order).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_category(state: State<'_, DbState>, id: i64, name: String, slug: String, parent_id: Option<i64>, sort_order: i32) -> Result<Category, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::category::update_category(&db, id, &name, &slug, parent_id, sort_order).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_category(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::category::delete_category(&db, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_categories(state: State<'_, DbState>) -> Result<Vec<Category>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::category::list_categories(&db).map_err(|e| e.to_string())
}
