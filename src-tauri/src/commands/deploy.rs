use crate::database::DbState;
use crate::deploy as deploy_mod;
use crate::deploy::cos;
use crate::generator;
use crate::models::*;
use crate::server::SiteServer;
use crate::services;

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

static PREVIEW_SERVER: Mutex<Option<SiteServer>> = Mutex::new(None);

#[tauri::command]
pub fn generate_site(state: State<'_, DbState>, output_path: String) -> Result<generator::GeneratedSite, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let path = PathBuf::from(&output_path);

    let (articles, _) = services::article::list_articles(&db, ArticleQuery {
        status: Some("published".to_string()),
        category_id: None,
        tag_id: None,
        keyword: None,
        sort_by: Some("updated_at".to_string()),
        sort_order: Some("DESC".to_string()),
        page: Some(1),
        page_size: Some(9999),
    }).map_err(|e| e.to_string())?;

    let config_entries = services::config::get_site_config(&db).map_err(|e| e.to_string())?;

    generator::generate_site(&path, &articles, &config_entries).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn preview_site(state: State<'_, DbState>) -> Result<serde_json::Value, String> {
    let db = state.lock().map_err(|e| e.to_string())?;

    let (articles, _) = services::article::list_articles(&db, ArticleQuery {
        status: Some("published".to_string()),
        category_id: None,
        tag_id: None,
        keyword: None,
        sort_by: Some("updated_at".to_string()),
        sort_order: Some("DESC".to_string()),
        page: Some(1),
        page_size: Some(9999),
    }).map_err(|e| e.to_string())?;

    let config_entries = services::config::get_site_config(&db).map_err(|e| e.to_string())?;

    let temp_dir = std::env::temp_dir().join("blogforge-preview");
    let _ = std::fs::remove_dir_all(&temp_dir);

    let generated = generator::generate_site(&temp_dir, &articles, &config_entries)
        .map_err(|e| e.to_string())?;

    let mut server_guard = PREVIEW_SERVER.lock().map_err(|e| e.to_string())?;
    if let Some(ref server) = *server_guard {
        server.stop();
    }
    *server_guard = None;
    drop(server_guard);

    let server = SiteServer::start(temp_dir.clone())?;
    let url = format!("http://127.0.0.1:{}", server.port());

    let mut guard = PREVIEW_SERVER.lock().map_err(|e| e.to_string())?;
    *guard = Some(server);

    Ok(serde_json::json!({
        "url": url,
        "files_count": generated.files_count,
    }))
}

#[tauri::command]
pub fn deploy_site(state: State<'_, DbState>, config_id: Option<i64>, output_path: String) -> Result<serde_json::Value, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let start = std::time::Instant::now();
    let path = PathBuf::from(&output_path);

    let (articles, _) = services::article::list_articles(&db, ArticleQuery {
        status: Some("published".to_string()),
        category_id: None,
        tag_id: None,
        keyword: None,
        sort_by: Some("updated_at".to_string()),
        sort_order: Some("DESC".to_string()),
        page: Some(1),
        page_size: Some(9999),
    }).map_err(|e| e.to_string())?;

    let config_entries = services::config::get_site_config(&db).map_err(|e| e.to_string())?;

    let result = if let Some(cid) = config_id {
        let config = services::deploy::get_deploy_config_by_id(&db, cid).map_err(|e| e.to_string())?;
        match config.method.as_str() {
            "cos" => {
                let cos_config: cos::CosConfig = serde_json::from_str(&config.config).map_err(|e| e.to_string())?;
                let msg = cos::deploy(&path, &cos_config).map_err(|e| e.to_string())?;
                deploy_mod::DeployResult {
                    success: true,
                    output_path: path.to_string_lossy().to_string(),
                    message: msg,
                }
            }
            _ => deploy_mod::deploy_local(&path, &articles, &config_entries).map_err(|e| e.to_string())?,
        }
    } else {
        deploy_mod::deploy_local(&path, &articles, &config_entries).map_err(|e| e.to_string())?
    };

    let duration = start.elapsed().as_millis() as i64;
    let status = if result.success { "success" } else { "failed" };

    services::deploy::add_deploy_log(
        &db, config_id, status, &result.message, 1, duration,
    )
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "success": result.success,
        "output_path": result.output_path,
        "message": result.message,
    }))
}

#[tauri::command]
pub fn create_deploy_config(state: State<'_, DbState>, name: String, method: String, config_json: String) -> Result<DeployConfig, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::deploy::create_deploy_config(&db, &name, &method, &config_json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_deploy_config(state: State<'_, DbState>, id: i64, name: String, method: String, config_json: String, is_default: bool) -> Result<DeployConfig, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::deploy::update_deploy_config(&db, id, &name, &method, &config_json, is_default).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_deploy_config(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::deploy::delete_deploy_config(&db, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_deploy_configs(state: State<'_, DbState>) -> Result<Vec<DeployConfig>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::deploy::list_deploy_configs(&db).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_deploy_logs(state: State<'_, DbState>, limit: Option<i64>) -> Result<Vec<DeployLog>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::deploy::list_deploy_logs(&db, limit).map_err(|e| e.to_string())
}
