pub mod commands {
    pub mod reader;
    pub mod search;
}
pub mod db;

use db::DatabaseState;
use std::path::PathBuf;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Locate database files in resource or current working directory
            let resource_dir = app
                .path()
                .resource_dir()
                .unwrap_or_else(|_| PathBuf::from("."));

            let reader_db_path = resource_dir.join("bible_reader.db");
            let semantic_db_path = resource_dir.join("bible_semantic.db");

            let db_state = DatabaseState::new(reader_db_path, semantic_db_path)
                .expect("Failed to initialize SQLite databases");

            app.manage(db_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::reader::get_versions,
            commands::reader::get_books,
            commands::reader::get_chapter,
            commands::search::search_keywords,
            commands::search::search_semantic,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
