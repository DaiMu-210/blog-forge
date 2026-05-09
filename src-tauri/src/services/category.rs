use crate::models::*;
use rusqlite::{params, Connection};

pub fn create_category(db: &Connection, name: &str, slug: &str, parent_id: Option<i64>, sort_order: i32) -> AppResult<Category> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO categories (name, slug, parent_id, sort_order, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, slug, parent_id, sort_order, now],
    )?;
    let id = db.last_insert_rowid();
    get_category_by_id(db, id)
}

pub fn update_category(db: &Connection, id: i64, name: &str, slug: &str, parent_id: Option<i64>, sort_order: i32) -> AppResult<Category> {
    db.execute(
        "UPDATE categories SET name=?1, slug=?2, parent_id=?3, sort_order=?4 WHERE id=?5",
        params![name, slug, parent_id, sort_order, id],
    )?;
    get_category_by_id(db, id)
}

pub fn delete_category(db: &Connection, id: i64) -> AppResult<()> {
    db.execute("DELETE FROM article_categories WHERE category_id=?1", params![id])?;
    db.execute("UPDATE categories SET parent_id=NULL WHERE parent_id=?1", params![id])?;
    db.execute("DELETE FROM categories WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_categories(db: &Connection) -> AppResult<Vec<Category>> {
    let mut stmt = db.prepare(
        "SELECT id, name, slug, parent_id, sort_order, created_at FROM categories ORDER BY sort_order ASC, created_at ASC",
    )?;
    let cats = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            slug: row.get(2)?,
            parent_id: row.get(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;
    cats.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn set_article_category(db: &Connection, article_id: i64, category_id: i64) -> AppResult<()> {
    db.execute("DELETE FROM article_categories WHERE article_id=?1", params![article_id])?;
    db.execute(
        "INSERT INTO article_categories (article_id, category_id) VALUES (?1, ?2)",
        params![article_id, category_id],
    )?;
    Ok(())
}

fn get_category_by_id(db: &Connection, id: i64) -> AppResult<Category> {
    db.query_row(
        "SELECT id, name, slug, parent_id, sort_order, created_at FROM categories WHERE id=?1",
        params![id],
        |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                slug: row.get(2)?,
                parent_id: row.get(3)?,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Category {} not found", id)),
        other => AppError::Database(other),
    })
}
