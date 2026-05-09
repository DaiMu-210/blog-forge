use log::info;
use once_cell::sync::OnceCell;
use parking_lot::Mutex;
use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;

use crate::error::AppError;

static DB_CONNECTION: OnceCell<Mutex<Connection>> = OnceCell::new();

pub fn init_database(app_data_dir: PathBuf) -> Result<(), AppError> {
    std::fs::create_dir_all(&app_data_dir)?;
    let db_path = app_data_dir.join("blogforge.db");
    info!("Initializing database at: {:?}", db_path);

    let conn = Connection::open(&db_path)?;
    create_tables(&conn)?;
    DB_CONNECTION.set(Mutex::new(conn))
        .map_err(|_| AppError::Internal("Database already initialized".to_string()))?;
    info!("Database initialized successfully");
    Ok(())
}

pub fn get_connection() -> Result<parking_lot::MutexGuard<'static, Connection>, AppError> {
    DB_CONNECTION
        .get()
        .ok_or_else(|| AppError::Internal("Database not initialized".to_string()))
        .map(|m| m.lock())
}

fn create_tables(conn: &Connection) -> SqliteResult<()> {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT,
            excerpt TEXT,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            published_at DATETIME,
            cover_image TEXT,
            meta_title TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            is_top INTEGER DEFAULT 0,
            view_count INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
        CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
        CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            parent_id INTEGER,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

        CREATE TABLE IF NOT EXISTS article_tags (
            article_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (article_id, tag_id),
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS article_categories (
            article_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (article_id, category_id),
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS article_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_versions_article ON article_versions(article_id);

        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            storage_key TEXT NOT NULL,
            url TEXT NOT NULL,
            imagebed_id INTEGER,
            size INTEGER,
            width INTEGER,
            height INTEGER,
            mime_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (imagebed_id) REFERENCES imagebed_configs(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS imagebed_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            config_type TEXT NOT NULL,
            config TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS site_config (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS deploy_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            method TEXT NOT NULL,
            config TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS deploy_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_id INTEGER,
            status TEXT NOT NULL,
            message TEXT,
            files_count INTEGER,
            duration_ms INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_deploy_logs_created ON deploy_logs(created_at);

        CREATE TABLE IF NOT EXISTS custom_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT,
            layout TEXT DEFAULT 'page',
            is_published INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        "#,
    )?;
    Ok(())
}
