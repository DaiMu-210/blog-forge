use crate::models::*;
use rusqlite::{params, Connection};

pub fn get_config(db: &Connection, key: &str) -> AppResult<Option<String>> {
    let result = db.query_row(
        "SELECT value FROM site_config WHERE key=?1",
        params![key],
        |row| row.get(0),
    );
    match result {
        Ok(v) => Ok(Some(v)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(AppError::Database(e)),
    }
}

pub fn set_config(db: &Connection, key: &str, value: &str) -> AppResult<()> {
    db.execute(
        "INSERT OR REPLACE INTO site_config (key, value) VALUES (?1, ?2)",
        params![key, value],
    )?;
    Ok(())
}

pub fn get_site_config(db: &Connection) -> AppResult<Vec<SiteConfigEntry>> {
    let mut stmt = db.prepare("SELECT key, value FROM site_config ORDER BY key")?;
    let entries = stmt.query_map([], |row| {
        Ok(SiteConfigEntry {
            key: row.get(0)?,
            value: row.get(1)?,
        })
    })?;
    entries.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn update_site_config(db: &Connection, entries: &[SiteConfigEntry]) -> AppResult<()> {
    for entry in entries {
        db.execute(
            "INSERT OR REPLACE INTO site_config (key, value) VALUES (?1, ?2)",
            params![entry.key, entry.value],
        )?;
    }
    Ok(())
}
