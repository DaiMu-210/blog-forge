use crate::models::*;
use rusqlite::{params, Connection};

pub fn create_tag(db: &Connection, name: &str, slug: &str, color: &str) -> AppResult<Tag> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO tags (name, slug, color, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![name, slug, color, now],
    )?;
    let id = db.last_insert_rowid();
    get_tag_by_id(db, id)
}

pub fn update_tag(db: &Connection, id: i64, name: &str, slug: &str, color: &str) -> AppResult<Tag> {
    db.execute(
        "UPDATE tags SET name=?1, slug=?2, color=?3 WHERE id=?4",
        params![name, slug, color, id],
    )?;
    get_tag_by_id(db, id)
}

pub fn delete_tag(db: &Connection, id: i64) -> AppResult<()> {
    db.execute("DELETE FROM article_tags WHERE tag_id=?1", params![id])?;
    db.execute("DELETE FROM tags WHERE id=?1", params![id])?;
    Ok(())
}

pub fn list_tags(db: &Connection) -> AppResult<Vec<Tag>> {
    let mut stmt = db.prepare("SELECT id, name, slug, color, created_at FROM tags ORDER BY created_at DESC")?;
    let tags = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            slug: row.get(2)?,
            color: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;
    tags.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn get_tags_for_article(db: &Connection, article_id: i64) -> AppResult<Vec<Tag>> {
    let mut stmt = db.prepare(
        "SELECT t.id, t.name, t.slug, t.color, t.created_at FROM tags t INNER JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ?1",
    )?;
    let tags = stmt.query_map(params![article_id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            slug: row.get(2)?,
            color: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;
    tags.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn set_article_tags(db: &Connection, article_id: i64, tag_ids: &[i64]) -> AppResult<()> {
    db.execute("DELETE FROM article_tags WHERE article_id=?1", params![article_id])?;
    for tag_id in tag_ids {
        db.execute(
            "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?1, ?2)",
            params![article_id, tag_id],
        )?;
    }
    Ok(())
}

fn get_tag_by_id(db: &Connection, id: i64) -> AppResult<Tag> {
    db.query_row(
        "SELECT id, name, slug, color, created_at FROM tags WHERE id=?1",
        params![id],
        |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                slug: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Tag {} not found", id)),
        other => AppError::Database(other),
    })
}
