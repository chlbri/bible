pub mod commands {
    pub mod reader;
    pub mod search;
}
pub mod db;

use db::DatabaseState;
use std::path::PathBuf;
use tauri::Manager;

fn find_db(app: &tauri::App, filename: &str) -> PathBuf {
    let candidates = vec![
        // 1. Current directory
        PathBuf::from(filename),
        // 2. Monorepo root from apps/src-tauri
        PathBuf::from(format!("../../{}", filename)),
        // 3. Parent directory
        PathBuf::from(format!("../{}", filename)),
        // 4. Tauri Resource Directory
        app.path()
            .resource_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(filename),
        // 5. App Data Directory
        app.path()
            .app_data_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(filename),
    ];

    for path in candidates {
        if path.exists() {
            println!(" Loaded database {} from: {:?}", filename, path);
            return path;
        }
    }

    println!("⚠️ Database {} not found in standard paths, falling back to root path", filename);
    PathBuf::from(format!("../../{}", filename))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let reader_db_path = find_db(app, "bible_reader.db");
            let semantic_db_path = find_db(app, "bible_semantic.db");

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
