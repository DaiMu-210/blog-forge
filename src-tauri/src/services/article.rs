use crate::models::*;
use crate::utils;
use rusqlite::{params, Connection};

pub fn create_article(db: &Connection, dto: CreateArticleDto) -> AppResult<Article> {
    let title = dto.title.clone();
    let slug = dto.slug.unwrap_or_else(|| utils::slugify(&title));
    let content = dto.content.unwrap_or_default();
    let excerpt = dto.excerpt.unwrap_or_else(|| {
        content.chars().take(200).collect()
    });
    let status = dto.status.unwrap_or_else(|| "draft".to_string());
    let cover_image = dto.cover_image.unwrap_or_default();
    let meta_title = dto.meta_title.unwrap_or_default();
    let meta_description = dto.meta_description.unwrap_or_default();
    let meta_keywords = dto.meta_keywords.unwrap_or_default();
    let is_top = dto.is_top.unwrap_or(false);
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let published_at: Option<String> = if status == "published" {
        Some(now.clone())
    } else {
        None
    };

    db.execute(
        "INSERT INTO articles (title, slug, content, excerpt, status, created_at, updated_at, published_at, cover_image, meta_title, meta_description, meta_keywords, is_top) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
        params![title, slug, content, excerpt, status, now, now, published_at, cover_image, meta_title, meta_description, meta_keywords, is_top as i32],
    )?;

    let id = db.last_insert_rowid();
    let mut article = get_article_by_id(db, id)?;

    if let Some(category_id) = dto.category_id {
        db.execute(
            "INSERT OR REPLACE INTO article_categories (article_id, category_id) VALUES (?1, ?2)",
            params![id, category_id],
        )?;
    }

    if let Some(tag_ids) = dto.tag_ids {
        for tag_id in &tag_ids {
            db.execute(
                "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?1, ?2)",
                params![id, tag_id],
            )?;
        }
    }

    article.tags = get_tags_for_article(db, id)?;
    article.categories = get_categories_for_article(db, id)?;

    save_version(db, id, &article.title, &article.content)?;

    Ok(article)
}

pub fn update_article(db: &Connection, id: i64, dto: UpdateArticleDto, save_version_flag: bool) -> AppResult<Article> {
    let current = get_article_by_id(db, id)?;

    if save_version_flag {
        save_version(db, id, &current.title, &current.content)?;
    }

    let title = dto.title.unwrap_or(current.title);
    let slug = dto.slug.unwrap_or(current.slug);
    let content = dto.content.unwrap_or(current.content);
    let excerpt = dto.excerpt.unwrap_or(current.excerpt);
    let status = dto.status.unwrap_or(current.status.clone());
    let cover_image = dto.cover_image.unwrap_or(current.cover_image);
    let meta_title = dto.meta_title.unwrap_or(current.meta_title);
    let meta_description = dto.meta_description.unwrap_or(current.meta_description);
    let meta_keywords = dto.meta_keywords.unwrap_or(current.meta_keywords);
    let is_top = dto.is_top.unwrap_or(current.is_top);
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let published_at = if status == "published" && current.status != "published" {
        Some(now.clone())
    } else {
        current.published_at
    };

    db.execute(
        "UPDATE articles SET title=?1, slug=?2, content=?3, excerpt=?4, status=?5, updated_at=?6, published_at=?7, cover_image=?8, meta_title=?9, meta_description=?10, meta_keywords=?11, is_top=?12 WHERE id=?13",
        params![title, slug, content, excerpt, status, now, published_at, cover_image, meta_title, meta_description, meta_keywords, is_top as i32, id],
    )?;

    if let Some(category_id) = dto.category_id {
        db.execute("DELETE FROM article_categories WHERE article_id=?1", params![id])?;
        db.execute(
            "INSERT INTO article_categories (article_id, category_id) VALUES (?1, ?2)",
            params![id, category_id],
        )?;
    }

    if let Some(tag_ids) = dto.tag_ids {
        db.execute("DELETE FROM article_tags WHERE article_id=?1", params![id])?;
        for tag_id in &tag_ids {
            db.execute(
                "INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?1, ?2)",
                params![id, tag_id],
            )?;
        }
    }

    let mut article = get_article_by_id(db, id)?;
    article.tags = get_tags_for_article(db, id)?;
    article.categories = get_categories_for_article(db, id)?;

    Ok(article)
}

pub fn delete_article(db: &Connection, id: i64, soft: bool) -> AppResult<()> {
    if soft {
        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        db.execute(
            "UPDATE articles SET status='trash', updated_at=?1 WHERE id=?2",
            params![now, id],
        )?;
    } else {
        db.execute("DELETE FROM article_tags WHERE article_id=?1", params![id])?;
        db.execute("DELETE FROM article_categories WHERE article_id=?1", params![id])?;
        db.execute("DELETE FROM article_versions WHERE article_id=?1", params![id])?;
        db.execute("DELETE FROM articles WHERE id=?1", params![id])?;
    }
    Ok(())
}

pub fn get_article(db: &Connection, id: i64) -> AppResult<Article> {
    let mut article = get_article_by_id(db, id)?;
    article.tags = get_tags_for_article(db, id)?;
    article.categories = get_categories_for_article(db, id)?;
    Ok(article)
}

pub fn list_articles(db: &Connection, query: ArticleQuery) -> AppResult<(Vec<Article>, i64)> {
    let mut conditions = Vec::new();
    let mut params_vec: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref status) = query.status {
        conditions.push(format!("a.status = ?{}", params_vec.len() + 1));
        params_vec.push(Box::new(status.clone()));
    }

    if let Some(category_id) = query.category_id {
        conditions.push(format!(
            "a.id IN (SELECT article_id FROM article_categories WHERE category_id = ?{})",
            params_vec.len() + 1
        ));
        params_vec.push(Box::new(category_id));
    }

    if let Some(tag_id) = query.tag_id {
        conditions.push(format!(
            "a.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?{})",
            params_vec.len() + 1
        ));
        params_vec.push(Box::new(tag_id));
    }

    if let Some(ref keyword) = query.keyword {
        conditions.push(format!(
            "(a.title LIKE ?{0} OR a.content LIKE ?{0} OR a.excerpt LIKE ?{0})",
            params_vec.len() + 1
        ));
        params_vec.push(Box::new(format!("%{}%", keyword)));
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_sql = format!("SELECT COUNT(*) FROM articles a {}", where_clause);
    let total: i64 = db.query_row(&count_sql, rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())), |row| row.get(0))?;

    let sort_by = query.sort_by.unwrap_or_else(|| "created_at".to_string());
    let sort_order = query.sort_order.unwrap_or_else(|| "desc".to_string());
    let valid_sort = match sort_by.as_str() {
        "title" => "a.title",
        "updated_at" => "a.updated_at",
        _ => "a.created_at",
    };
    let valid_order = if sort_order == "asc" { "ASC" } else { "DESC" };

    let page = query.page.unwrap_or(1).max(1);
    let page_size = query.page_size.unwrap_or(20).min(100);
    let offset = (page - 1) * page_size;

    let list_sql = format!(
        "SELECT a.id, a.title, a.slug, a.content, a.excerpt, a.status, a.created_at, a.updated_at, a.published_at, a.cover_image, a.meta_title, a.meta_description, a.meta_keywords, a.is_top, a.view_count FROM articles a {} ORDER BY a.is_top DESC, {} {} LIMIT ?{} OFFSET ?{}",
        where_clause,
        valid_sort,
        valid_order,
        params_vec.len() + 1,
        params_vec.len() + 2
    );

    params_vec.push(Box::new(page_size));
    params_vec.push(Box::new(offset));

    let mut stmt = db.prepare(&list_sql)?;
    let articles = stmt.query_map(
        rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
        |row| {
            Ok(Article {
                id: row.get(0)?,
                title: row.get(1)?,
                slug: row.get(2)?,
                content: row.get(3)?,
                excerpt: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                published_at: row.get(8)?,
                cover_image: row.get(9)?,
                meta_title: row.get(10)?,
                meta_description: row.get(11)?,
                meta_keywords: row.get(12)?,
                is_top: row.get::<_, i32>(13)? != 0,
                view_count: row.get(14)?,
                tags: Vec::new(),
                categories: Vec::new(),
            })
        },
    )?;

    let mut result = Vec::new();
    for article in articles {
        let mut a = article?;
        a.tags = get_tags_for_article(db, a.id)?;
        a.categories = get_categories_for_article(db, a.id)?;
        result.push(a);
    }

    Ok((result, total))
}

pub fn search_articles(db: &Connection, keyword: &str) -> AppResult<Vec<Article>> {
    let pattern = format!("%{}%", keyword);
    let mut stmt = db.prepare(
        "SELECT id, title, slug, content, excerpt, status, created_at, updated_at, published_at, cover_image, meta_title, meta_description, meta_keywords, is_top, view_count FROM articles WHERE title LIKE ?1 OR content LIKE ?1 OR excerpt LIKE ?1 ORDER BY updated_at DESC LIMIT 50",
    )?;

    let articles = stmt.query_map(params![pattern], |row| {
        Ok(Article {
            id: row.get(0)?,
            title: row.get(1)?,
            slug: row.get(2)?,
            content: row.get(3)?,
            excerpt: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            published_at: row.get(8)?,
            cover_image: row.get(9)?,
            meta_title: row.get(10)?,
            meta_description: row.get(11)?,
            meta_keywords: row.get(12)?,
            is_top: row.get::<_, i32>(13)? != 0,
            view_count: row.get(14)?,
            tags: Vec::new(),
            categories: Vec::new(),
        })
    })?;

    let mut result = Vec::new();
    for article in articles {
        result.push(article?);
    }
    Ok(result)
}

pub fn get_article_versions(db: &Connection, article_id: i64) -> AppResult<Vec<ArticleVersion>> {
    let mut stmt = db.prepare(
        "SELECT id, article_id, title, content, created_at FROM article_versions WHERE article_id=?1 ORDER BY created_at DESC",
    )?;
    let versions = stmt.query_map(params![article_id], |row| {
        Ok(ArticleVersion {
            id: row.get(0)?,
            article_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;
    versions.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn restore_version(db: &Connection, article_id: i64, version_id: i64) -> AppResult<Article> {
    let version = db.query_row(
        "SELECT title, content FROM article_versions WHERE id=?1 AND article_id=?2",
        params![version_id, article_id],
        |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        },
    )?;

    let current = get_article_by_id(db, article_id)?;
    save_version(db, article_id, &current.title, &current.content)?;

    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "UPDATE articles SET title=?1, content=?2, updated_at=?3 WHERE id=?4",
        params![version.0, version.1, now, article_id],
    )?;

    get_article(db, article_id)
}

fn get_article_by_id(db: &Connection, id: i64) -> AppResult<Article> {
    db.query_row(
        "SELECT id, title, slug, content, excerpt, status, created_at, updated_at, published_at, cover_image, meta_title, meta_description, meta_keywords, is_top, view_count FROM articles WHERE id=?1",
        params![id],
        |row| {
            Ok(Article {
                id: row.get(0)?,
                title: row.get(1)?,
                slug: row.get(2)?,
                content: row.get(3)?,
                excerpt: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                published_at: row.get(8)?,
                cover_image: row.get(9)?,
                meta_title: row.get(10)?,
                meta_description: row.get(11)?,
                meta_keywords: row.get(12)?,
                is_top: row.get::<_, i32>(13)? != 0,
                view_count: row.get(14)?,
                tags: Vec::new(),
                categories: Vec::new(),
            })
        },
    ).map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Article {} not found", id)),
        other => AppError::Database(other),
    })
}

fn save_version(db: &Connection, article_id: i64, title: &str, content: &str) -> AppResult<()> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    db.execute(
        "INSERT INTO article_versions (article_id, title, content, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![article_id, title, content, now],
    )?;
    Ok(())
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

pub fn get_categories_for_article(db: &Connection, article_id: i64) -> AppResult<Vec<Category>> {
    let mut stmt = db.prepare(
        "SELECT c.id, c.name, c.slug, c.parent_id, c.sort_order, c.created_at FROM categories c INNER JOIN article_categories ac ON c.id = ac.category_id WHERE ac.article_id = ?1",
    )?;
    let cats = stmt.query_map(params![article_id], |row| {
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
