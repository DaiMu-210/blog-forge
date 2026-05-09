use rusqlite::{Connection, Result as SqlResult, params};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::fs;
use tauri::{AppHandle, Manager};

const DB_VERSION: i32 = 1;

pub type DbState = Arc<Mutex<Connection>>;

fn get_app_dir(app: &AppHandle) -> PathBuf {
    let binding = app.path().app_data_dir().unwrap();
    fs::create_dir_all(&binding).ok();
    binding
}

fn backup_db(db_path: &PathBuf) {
    if !db_path.exists() {
        return;
    }
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_name = format!("blogforge_backup_{}.db", timestamp);
    let backup_path = db_path.parent().unwrap().join(&backup_name);
    fs::copy(db_path, &backup_path).ok();

    let dir = db_path.parent().unwrap();
    if let Ok(entries) = fs::read_dir(dir) {
        let mut backups: Vec<_> = entries
            .filter_map(|e| e.ok())
            .filter(|e| e.file_name().to_string_lossy().starts_with("blogforge_backup_"))
            .collect();
        backups.sort_by_key(|e| e.metadata().and_then(|m| m.modified()).ok());
        // Keep only 5 most recent
        while backups.len() > 5 {
            if let Some(oldest) = backups.first() {
                fs::remove_file(oldest.path()).ok();
                backups.remove(0);
            }
        }
    }
}

fn create_tables(conn: &Connection) -> SqlResult<()> {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT DEFAULT '',
            excerpt TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft',
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            published_at TEXT,
            cover_image TEXT DEFAULT '',
            meta_title TEXT DEFAULT '',
            meta_description TEXT DEFAULT '',
            meta_keywords TEXT DEFAULT '',
            is_top INTEGER NOT NULL DEFAULT 0,
            view_count INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
        CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
        CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            color TEXT DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            parent_id INTEGER REFERENCES categories(id),
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS article_tags (
            article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
            tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (article_id, tag_id)
        );

        CREATE TABLE IF NOT EXISTS article_categories (
            article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            PRIMARY KEY (article_id, category_id)
        );

        CREATE TABLE IF NOT EXISTS article_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );
        CREATE INDEX IF NOT EXISTS idx_versions_article ON article_versions(article_id);

        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            storage_key TEXT NOT NULL DEFAULT '',
            url TEXT NOT NULL,
            imagebed_id INTEGER REFERENCES imagebed_configs(id) ON DELETE SET NULL,
            size INTEGER DEFAULT 0,
            width INTEGER DEFAULT 0,
            height INTEGER DEFAULT 0,
            mime_type TEXT DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS imagebed_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            config TEXT NOT NULL DEFAULT '{}',
            is_default INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS site_config (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS deploy_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            method TEXT NOT NULL,
            config TEXT NOT NULL DEFAULT '{}',
            is_default INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS deploy_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_id INTEGER REFERENCES deploy_configs(id) ON DELETE SET NULL,
            status TEXT NOT NULL,
            message TEXT DEFAULT '',
            files_count INTEGER DEFAULT 0,
            duration_ms INTEGER DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );
        CREATE INDEX IF NOT EXISTS idx_deploy_logs_created ON deploy_logs(created_at);

        CREATE TABLE IF NOT EXISTS custom_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT DEFAULT '',
            layout TEXT NOT NULL DEFAULT 'page',
            is_published INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );
    ")?;
    Ok(())
}

fn insert_defaults(conn: &Connection) -> SqlResult<()> {
    let inserts = [
        ("site_info", r#"{"name":"BlogForge","description":"My Blog","author":"","url":"","language":"zh-CN"}"#),
        ("theme", "{\"mode\":\"light\",\"primary_color\":\"#1890FF\"}"),
        ("navigation", r#"{"items":[]}"#),
        ("social_links", r#"{"github":"","twitter":"","email":""}"#),
        ("seo_settings", r#"{"meta_title":"","meta_description":"","meta_keywords":"","google_verification":"","baidu_verification":""}"#),
        ("comment_config", r#"{"provider":"none","config":{}}"#),
        ("analytics_config", r#"{"provider":"none","config":{}}"#),
        ("app_settings", r#"{"language":"zh-CN","theme":"light","autosave_interval":30}"#),
    ];
    for (key, value) in &inserts {
        conn.execute(
            "INSERT OR IGNORE INTO site_config (key, value) VALUES (?1, ?2)",
            params![key, value],
        )?;
    }
    Ok(())
}

fn ensure_db_version(conn: &Connection) -> SqlResult<()> {
    let version: Option<String> = conn
        .query_row(
            "SELECT value FROM site_config WHERE key = 'db_version'",
            [],
            |row| row.get(0),
        )
        .ok();
    if version.is_none() {
        conn.execute(
            "INSERT OR REPLACE INTO site_config (key, value) VALUES ('db_version', ?1)",
            params![DB_VERSION.to_string()],
        )?;
    }
    Ok(())
}

pub fn init_db(app: &AppHandle) -> SqlResult<DbState> {
    let app_dir = get_app_dir(app);
    let db_path = app_dir.join("blogforge.db");
    backup_db(&db_path);

    let conn = Connection::open(&db_path)?;
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "foreign_keys", "ON")?;

    create_tables(&conn)?;
    insert_defaults(&conn)?;
    ensure_db_version(&conn)?;

    Ok(Arc::new(Mutex::new(conn)))
}
