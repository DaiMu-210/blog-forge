use crate::models::*;
use rusqlite::{params, Connection};

pub fn create_image(
    db: &Connection,
    filename: &str,
    storage_key: &str,
    url: &str,
    imagebed_id: Option<i64>,
    size: i64,
    width: i32,
    height: i32,
    mime_type: &str,
) -> AppResult<Image> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO images (filename, storage_key, url, imagebed_id, size, width, height, mime_type, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![filename, storage_key, url, imagebed_id, size, width, height, mime_type, now],
    )?;
    let id = db.last_insert_rowid();
    get_image_by_id(db, id)
}

pub fn delete_image(db: &Connection, id: i64) -> AppResult<()> {
    db.execute("DELETE FROM images WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_images(db: &Connection, imagebed_id: Option<i64>) -> AppResult<Vec<Image>> {
    let sql = if imagebed_id.is_some() {
        "SELECT id, filename, storage_key, url, imagebed_id, size, width, height, mime_type, created_at FROM images WHERE imagebed_id=?1 ORDER BY created_at DESC"
    } else {
        "SELECT id, filename, storage_key, url, imagebed_id, size, width, height, mime_type, created_at FROM images ORDER BY created_at DESC"
    };

    let mut stmt = db.prepare(sql)?;
    let images = if let Some(bid) = imagebed_id {
        stmt.query_map(params![bid], map_image)?
    } else {
        stmt.query_map([], map_image)?
    };
    images.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn get_image_by_id(db: &Connection, id: i64) -> AppResult<Image> {
    db.query_row(
        "SELECT id, filename, storage_key, url, imagebed_id, size, width, height, mime_type, created_at FROM images WHERE id=?1",
        params![id],
        map_image,
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Image {} not found", id)),
        other => AppError::Database(other),
    })
}

fn map_image(row: &rusqlite::Row) -> rusqlite::Result<Image> {
    Ok(Image {
        id: row.get(0)?,
        filename: row.get(1)?,
        storage_key: row.get(2)?,
        url: row.get(3)?,
        imagebed_id: row.get(4)?,
        size: row.get(5)?,
        width: row.get(6)?,
        height: row.get(7)?,
        mime_type: row.get(8)?,
        created_at: row.get(9)?,
    })
}
