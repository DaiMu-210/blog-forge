use chrono::Utc;
use rusqlite::params;
use slug::slugify;

use crate::database::get_connection;
use crate::error::AppError;
use crate::models::{Category, CreateCategoryDto, Tag, CreateTagDto};

#[command]
pub async fn create_tag(dto: CreateTagDto) -> Result<Tag, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let slug = slugify(&dto.name);
    let now = Utc::now();

    conn.execute(
        "INSERT INTO tags (name, slug, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![dto.name, slug, dto.color, now],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    Ok(Tag {
        id,
        name: dto.name,
        slug,
        color: dto.color,
        created_at: now,
    })
}

#[command]
pub async fn list_tags() -> Result<Vec<Tag>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, name, slug, color, created_at FROM tags ORDER BY name"
    ).map_err(|e| e.to_string())?;

    let tags = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            slug: row.get(2)?,
            color: row.get(3)?,
            created_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(tags)
}

#[command]
pub async fn delete_tag(id: i64) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn create_category(dto: CreateCategoryDto) -> Result<Category, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let slug = slugify(&dto.name);
    let now = Utc::now();
    let sort_order = dto.sort_order.unwrap_or(0);

    conn.execute(
        "INSERT INTO categories (name, slug, parent_id, sort_order, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![dto.name, slug, dto.parent_id, sort_order, now],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    Ok(Category {
        id,
        name: dto.name,
        slug,
        parent_id: dto.parent_id,
        sort_order,
        created_at: now,
    })
}

#[command]
pub async fn list_categories() -> Result<Vec<Category>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, name, slug, parent_id, sort_order, created_at FROM categories ORDER BY sort_order, name"
    ).map_err(|e| e.to_string())?;

    let categories = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            slug: row.get(2)?,
            parent_id: row.get(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(categories)
}

#[command]
pub async fn delete_category(id: i64) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM categories WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
