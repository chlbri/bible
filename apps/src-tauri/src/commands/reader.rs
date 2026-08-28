use crate::db::DatabaseState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct VersionDto {
    pub id: String,
    pub name: String,
    pub language: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BookDto {
    pub id: String,
    pub testament: String,
    pub name: String,
    pub order_index: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerseDto {
    pub verse: i32,
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChapterDto {
    pub version_id: String,
    pub book_id: String,
    pub chapter: i32,
    pub verses: Vec<VerseDto>,
}

#[tauri::command]
pub fn get_versions(db: State<'_, DatabaseState>) -> Result<Vec<VersionDto>, String> {
    let conn = db.reader_conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, language FROM versions ORDER BY name ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(VersionDto {
                id: row.get(0)?,
                name: row.get(1)?,
                language: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut versions = Vec::new();
    for version in rows {
        versions.push(version.map_err(|e| e.to_string())?);
    }
    Ok(versions)
}

#[tauri::command]
pub fn get_books(db: State<'_, DatabaseState>) -> Result<Vec<BookDto>, String> {
    let conn = db.reader_conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, testament, name, order_index FROM books ORDER BY order_index ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(BookDto {
                id: row.get(0)?,
                testament: row.get(1)?,
                name: row.get(2)?,
                order_index: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut books = Vec::new();
    for book in rows {
        books.push(book.map_err(|e| e.to_string())?);
    }
    Ok(books)
}

#[tauri::command]
pub fn get_chapter(
    version_id: String,
    book_id: String,
    chapter: i32,
    db: State<'_, DatabaseState>,
) -> Result<ChapterDto, String> {
    let conn = db.reader_conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT verse, text FROM verses 
             WHERE version_id = ?1 AND book_id = ?2 AND chapter = ?3 
             ORDER BY verse ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([&version_id, &book_id, &chapter.to_string()], |row| {
            Ok(VerseDto {
                verse: row.get(0)?,
                text: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut verses = Vec::new();
    for verse in rows {
        verses.push(verse.map_err(|e| e.to_string())?);
    }

    Ok(ChapterDto {
        version_id,
        book_id,
        chapter,
        verses,
    })
}
