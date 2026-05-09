use crate::models::*;
use rusqlite::{params, Connection};

pub fn create_custom_page(db: &Connection, title: &str, slug: &str, content: &str, layout: &str) -> AppResult<CustomPage> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO custom_pages (title, slug, content, layout, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![title, slug, content, layout, now, now],
    )?;
    let id = db.last_insert_rowid();
    get_custom_page_by_id(db, id)
}

pub fn update_custom_page(
    db: &Connection,
    id: i64,
    title: &str,
    slug: &str,
    content: &str,
    layout: &str,
    is_published: bool,
) -> AppResult<CustomPage> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "UPDATE custom_pages SET title=?1, slug=?2, content=?3, layout=?4, is_published=?5, updated_at=?6 WHERE id=?7",
        params![title, slug, content, layout, is_published as i32, now, id],
    )?;
    get_custom_page_by_id(db, id)
}

pub fn delete_custom_page(db: &Connection, id: i64) -> AppResult<()> {
    db.execute("DELETE FROM custom_pages WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_custom_pages(db: &Connection) -> AppResult<Vec<CustomPage>> {
    let mut stmt = db.prepare(
        "SELECT id, title, slug, content, layout, is_published, created_at, updated_at FROM custom_pages ORDER BY created_at DESC",
    )?;
    let pages = stmt.query_map([], |row| {
        Ok(CustomPage {
            id: row.get(0)?,
            title: row.get(1)?,
            slug: row.get(2)?,
            content: row.get(3)?,
            layout: row.get(4)?,
            is_published: row.get::<_, i32>(5)? != 0,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })?;
    pages.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

fn get_custom_page_by_id(db: &Connection, id: i64) -> AppResult<CustomPage> {
    db.query_row(
        "SELECT id, title, slug, content, layout, is_published, created_at, updated_at FROM custom_pages WHERE id=?1",
        params![id],
        |row| {
            Ok(CustomPage {
                id: row.get(0)?,
                title: row.get(1)?,
                slug: row.get(2)?,
                content: row.get(3)?,
                layout: row.get(4)?,
                is_published: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Custom page {} not found", id)),
        other => AppError::Database(other),
    })
}
