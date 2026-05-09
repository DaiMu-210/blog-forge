mod commands;
mod database;
mod error;
mod models;
mod services;

use log::info;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            info!("BlogForge starting up...");

            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            database::init_database(app_data_dir)?;

            info!("BlogForge initialized successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::article::create_article,
            commands::article::update_article,
            commands::article::delete_article,
            commands::article::get_article,
            commands::article::list_articles,
            commands::article::search_articles,
            commands::article::publish_article,
            commands::article::unpublish_article,
            commands::article::get_article_versions,
            commands::article::restore_article_version,
            commands::tag::create_tag,
            commands::tag::list_tags,
            commands::tag::delete_tag,
            commands::tag::create_category,
            commands::tag::list_categories,
            commands::tag::delete_category,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
