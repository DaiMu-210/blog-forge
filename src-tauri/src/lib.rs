pub mod commands;
pub mod models;
pub mod services;
pub mod database;
pub mod generator;
pub mod imagebed;
pub mod deploy;
pub mod server;
pub mod utils;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let db_state = database::init_db(app.handle())?;
            app.manage(db_state);
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
            commands::article::restore_version,
            commands::article::preview_article,
            commands::article::create_tag,
            commands::article::update_tag,
            commands::article::delete_tag,
            commands::article::list_tags,
            commands::article::create_category,
            commands::article::update_category,
            commands::article::delete_category,
            commands::article::list_categories,
            commands::image::upload_image,
            commands::image::delete_image,
            commands::image::list_images,
            commands::image::create_imagebed,
            commands::image::update_imagebed,
            commands::image::delete_imagebed,
            commands::image::list_imagebeds,
            commands::image::test_imagebed,
            commands::image::set_default_imagebed,
            commands::deploy::generate_site,
            commands::deploy::preview_site,
            commands::deploy::deploy_site,
            commands::deploy::create_deploy_config,
            commands::deploy::update_deploy_config,
            commands::deploy::delete_deploy_config,
            commands::deploy::list_deploy_configs,
            commands::deploy::get_deploy_logs,
            commands::config::get_site_config,
            commands::config::update_site_config,
            commands::config::create_custom_page,
            commands::config::update_custom_page,
            commands::config::delete_custom_page,
            commands::config::list_custom_pages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
