use crate::models::*;
use rusqlite::{params, Connection};

pub fn create_deploy_config(db: &Connection, name: &str, method: &str, config_json: &str) -> AppResult<DeployConfig> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO deploy_configs (name, method, config, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, method, config_json, now, now],
    )?;
    let id = db.last_insert_rowid();
    get_deploy_config_by_id(db, id)
}

pub fn update_deploy_config(db: &Connection, id: i64, name: &str, method: &str, config_json: &str, is_default: bool) -> AppResult<DeployConfig> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    if is_default {
        db.execute("UPDATE deploy_configs SET is_default=0", [])?;
    }
    db.execute(
        "UPDATE deploy_configs SET name=?1, method=?2, config=?3, is_default=?4, updated_at=?5 WHERE id=?6",
        params![name, method, config_json, is_default as i32, now, id],
    )?;
    get_deploy_config_by_id(db, id)
}

pub fn delete_deploy_config(db: &Connection, id: i64) -> AppResult<()> {
    db.execute("DELETE FROM deploy_configs WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_deploy_configs(db: &Connection) -> AppResult<Vec<DeployConfig>> {
    let mut stmt = db.prepare(
        "SELECT id, name, method, config, is_default, created_at, updated_at FROM deploy_configs ORDER BY created_at DESC",
    )?;
    let configs = stmt.query_map([], map_deploy_config)?;
    configs.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn set_default_deploy(db: &Connection, id: i64) -> AppResult<()> {
    db.execute("UPDATE deploy_configs SET is_default=0", [])?;
    db.execute("UPDATE deploy_configs SET is_default=1 WHERE id=?1", params![id])?;
    Ok(())
}

pub fn add_deploy_log(
    db: &Connection,
    config_id: Option<i64>,
    status: &str,
    message: &str,
    files_count: i64,
    duration_ms: i64,
) -> AppResult<DeployLog> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO deploy_logs (config_id, status, message, files_count, duration_ms, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![config_id, status, message, files_count, duration_ms, now],
    )?;
    let id = db.last_insert_rowid();
    db.query_row(
        "SELECT id, config_id, status, message, files_count, duration_ms, created_at FROM deploy_logs WHERE id=?1",
        params![id],
        |row| {
            Ok(DeployLog {
                id: row.get(0)?,
                config_id: row.get(1)?,
                status: row.get(2)?,
                message: row.get(3)?,
                files_count: row.get(4)?,
                duration_ms: row.get(5)?,
                created_at: row.get(6)?,
            })
        },
    )
    .map_err(Into::into)
}

pub fn list_deploy_logs(db: &Connection, limit: Option<i64>) -> AppResult<Vec<DeployLog>> {
    let limit_val = limit.unwrap_or(50);
    let mut stmt = db.prepare(
        "SELECT id, config_id, status, message, files_count, duration_ms, created_at FROM deploy_logs ORDER BY created_at DESC LIMIT ?1",
    )?;
    let logs = stmt.query_map(params![limit_val], |row| {
        Ok(DeployLog {
            id: row.get(0)?,
            config_id: row.get(1)?,
            status: row.get(2)?,
            message: row.get(3)?,
            files_count: row.get(4)?,
            duration_ms: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;
    logs.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn get_deploy_config_by_id(db: &Connection, id: i64) -> AppResult<DeployConfig> {
    db.query_row(
        "SELECT id, name, method, config, is_default, created_at, updated_at FROM deploy_configs WHERE id=?1",
        params![id],
        map_deploy_config,
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Deploy config {} not found", id)),
        other => AppError::Database(other),
    })
}

fn map_deploy_config(row: &rusqlite::Row) -> rusqlite::Result<DeployConfig> {
    Ok(DeployConfig {
        id: row.get(0)?,
        name: row.get(1)?,
        method: row.get(2)?,
        config: row.get(3)?,
        is_default: row.get::<_, i32>(4)? != 0,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}
