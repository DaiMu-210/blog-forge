use crate::database::DbState;
use crate::models::*;
use crate::services;

use tauri::State;

#[tauri::command]
pub fn get_site_config(state: State<'_, DbState>) -> Result<Vec<SiteConfigEntry>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::config::get_site_config(&db).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_site_config(state: State<'_, DbState>, entries: Vec<SiteConfigEntry>) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::config::update_site_config(&db, &entries).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_custom_page(state: State<'_, DbState>, title: String, slug: String, content: String, layout: String) -> Result<CustomPage, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::custom_page::create_custom_page(&db, &title, &slug, &content, &layout).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_custom_page(state: State<'_, DbState>, id: i64, title: String, slug: String, content: String, layout: String, is_published: bool) -> Result<CustomPage, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::custom_page::update_custom_page(&db, id, &title, &slug, &content, &layout, is_published).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_custom_page(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::custom_page::delete_custom_page(&db, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_custom_pages(state: State<'_, DbState>) -> Result<Vec<CustomPage>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::custom_page::list_custom_pages(&db).map_err(|e| e.to_string())
}
