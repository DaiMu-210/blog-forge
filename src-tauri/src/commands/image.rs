use crate::database::DbState;
use crate::models::*;
use crate::services;

use tauri::State;

#[tauri::command]
pub fn upload_image(state: State<'_, DbState>, file_path: String, imagebed_id: Option<i64>) -> Result<Image, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let data = std::fs::read(&file_path).map_err(|e| AppError::Io(e).to_string())?;
    let path = std::path::Path::new(&file_path);
    let filename = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();
    let mime = mime_guess::from_path(&file_path).first_or_octet_stream().to_string();
    let size = data.len() as i64;
    let storage_key = format!("images/{}", filename);
    let url = format!("file://{}", file_path);

    services::image::create_image(
        &db, &filename, &storage_key, &url, imagebed_id,
        size, 0, 0, &mime,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_image(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::image::delete_image(&db, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_images(state: State<'_, DbState>, imagebed_id: Option<i64>) -> Result<Vec<Image>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    services::image::list_images(&db, imagebed_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_imagebed(state: State<'_, DbState>, name: String, method: String, config_json: String) -> Result<ImagebedConfig, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO imagebed_configs (name, method, config, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![name, method, config_json, now, now],
    )
    .map_err(|e| AppError::Database(e).to_string())?;
    let id = db.last_insert_rowid();
    db.query_row(
        "SELECT id, name, method, config, is_default, created_at, updated_at FROM imagebed_configs WHERE id=?1",
        rusqlite::params![id],
        |row| {
            Ok(ImagebedConfig {
                id: row.get(0)?,
                name: row.get(1)?,
                type_field: row.get(2)?,
                config: row.get(3)?,
                is_default: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| AppError::Database(e).to_string())
}

#[tauri::command]
pub fn update_imagebed(state: State<'_, DbState>, id: i64, name: String, method: String, config_json: String) -> Result<ImagebedConfig, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "UPDATE imagebed_configs SET name=?1, method=?2, config=?3, updated_at=?4 WHERE id=?5",
        rusqlite::params![name, method, config_json, now, id],
    )
    .map_err(|e| AppError::Database(e).to_string())?;
    db.query_row(
        "SELECT id, name, method, config, is_default, created_at, updated_at FROM imagebed_configs WHERE id=?1",
        rusqlite::params![id],
        |row| {
            Ok(ImagebedConfig {
                id: row.get(0)?,
                name: row.get(1)?,
                type_field: row.get(2)?,
                config: row.get(3)?,
                is_default: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| AppError::Database(e).to_string())
}

#[tauri::command]
pub fn delete_imagebed(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    db.execute("DELETE FROM imagebed_configs WHERE id=?1", rusqlite::params![id])
        .map_err(|e| AppError::Database(e).to_string())?;
    Ok(())
}

#[tauri::command]
pub fn list_imagebeds(state: State<'_, DbState>) -> Result<Vec<ImagebedConfig>, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = db.prepare(
        "SELECT id, name, method, config, is_default, created_at, updated_at FROM imagebed_configs ORDER BY created_at DESC",
    )
    .map_err(|e| AppError::Database(e).to_string())?;
    let configs = stmt.query_map([], |row| {
        Ok(ImagebedConfig {
            id: row.get(0)?,
            name: row.get(1)?,
            type_field: row.get(2)?,
            config: row.get(3)?,
            is_default: row.get::<_, i32>(4)? != 0,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })
    .map_err(|e| AppError::Database(e).to_string())?;
    configs.collect::<Result<Vec<_>, _>>().map_err(|e| AppError::Database(e).to_string())
}

#[tauri::command]
pub fn test_imagebed(state: State<'_, DbState>, id: i64) -> Result<bool, String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    let method: String = db.query_row(
        "SELECT method FROM imagebed_configs WHERE id=?1",
        rusqlite::params![id],
        |row| row.get(0),
    )
    .map_err(|e| AppError::Database(e).to_string())?;
    Ok(method == "local")
}

#[tauri::command]
pub fn set_default_imagebed(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let db = state.lock().map_err(|e| e.to_string())?;
    db.execute("UPDATE imagebed_configs SET is_default=0", [])
        .map_err(|e| AppError::Database(e).to_string())?;
    db.execute("UPDATE imagebed_configs SET is_default=1 WHERE id=?1", rusqlite::params![id])
        .map_err(|e| AppError::Database(e).to_string())?;
    Ok(())
}
