use crate::db::DatabaseState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct KeywordResultDto {
    pub id: String,
    pub book_id: String,
    pub chapter: i32,
    pub verse: i32,
    pub text: String,
    pub rank: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SemanticResultDto {
    pub id: String,
    pub book_id: String,
    pub chapter: i32,
    pub verse: i32,
    pub text: String,
    pub similarity: f32,
}

#[derive(Deserialize)]
struct OllamaEmbedResponse {
    embeddings: Option<Vec<Vec<f32>>>,
}

#[tauri::command]
pub fn search_keywords(
    version_id: String,
    query: String,
    limit: Option<usize>,
    db: State<'_, DatabaseState>,
) -> Result<Vec<KeywordResultDto>, String> {
    let limit_val = limit.unwrap_or(20);
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }

    // 1. Try SQLite FTS5 in semantic_conn
    if let Ok(conn) = db.semantic_conn.lock() {
        // Sanitize for FTS5: split words, wrap in quotes with prefix wildcard
        let fts_query = trimmed
            .replace(['"', '\'', '*', '^', ':'], " ")
            .split_whitespace()
            .map(|word| format!("\"{}\"*", word))
            .collect::<Vec<_>>()
            .join(" ");

        if !fts_query.is_empty() {
            if let Ok(mut stmt) = conn.prepare(
                "SELECT id, book_id, chapter, verse, text, rank 
                 FROM verses_fts 
                 WHERE version_id = ?1 AND verses_fts MATCH ?2 
                 ORDER BY rank ASC 
                 LIMIT ?3",
            ) {
                if let Ok(rows) = stmt.query_map(
                    [&version_id, &fts_query, &limit_val.to_string()],
                    |row| {
                        Ok(KeywordResultDto {
                            id: row.get(0)?,
                            book_id: row.get(1)?,
                            chapter: row.get(2)?,
                            verse: row.get(3)?,
                            text: row.get(4)?,
                            rank: row.get(5)?,
                        })
                    },
                ) {
                    let mut results = Vec::new();
                    for r in rows.flatten() {
                        results.push(r);
                    }
                    if !results.is_empty() {
                        return Ok(results);
                    }
                }
            }
        }
    }

    // 2. Fallback: Search reader_conn with LIKE
    let reader_conn = db.reader_conn.lock().map_err(|e| e.to_string())?;
    let like_pattern = format!("%{}%", trimmed);
    let mut stmt = reader_conn
        .prepare(
            "SELECT version_id || '_' || book_id || '_' || chapter || '_' || verse AS id, 
                    book_id, chapter, verse, text 
             FROM verses 
             WHERE version_id = ?1 AND text LIKE ?2 
             ORDER BY chapter ASC, verse ASC 
             LIMIT ?3",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(
            [&version_id, &like_pattern, &limit_val.to_string()],
            |row| {
                Ok(KeywordResultDto {
                    id: row.get(0)?,
                    book_id: row.get(1)?,
                    chapter: row.get(2)?,
                    verse: row.get(3)?,
                    text: row.get(4)?,
                    rank: 0.0,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for r in rows.flatten() {
        results.push(r);
    }
    Ok(results)
}

#[tauri::command]
pub async fn search_semantic(
    version_id: String,
    query: String,
    limit: Option<usize>,
    db: State<'_, DatabaseState>,
) -> Result<Vec<SemanticResultDto>, String> {
    let limit_val = limit.unwrap_or(10);

    // 1. Fetch query vector embedding from local Ollama
    let client = reqwest::Client::new();
    let res = client
        .post("http://localhost:11434/api/embed")
        .json(&serde_json::json!({
            "model": "nomic-embed-text",
            "input": [query]
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to call Ollama: {}", e))?;

    let json_resp: OllamaEmbedResponse = res
        .json()
        .await
        .map_err(|e| format!("Invalid response from Ollama: {}", e))?;

    let query_vector = json_resp
        .embeddings
        .and_then(|mut embs| embs.pop())
        .ok_or_else(|| "No embedding returned by Ollama".to_string())?;

    // 2. Read stored verse vectors from SQLite
    let conn = db.semantic_conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, book_id, chapter, verse, text, vector 
             FROM verses_vectors 
             WHERE version_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let mut verses_with_scores = Vec::new();

    let rows = stmt
        .query_map([&version_id], |row| {
            let id: String = row.get(0)?;
            let book_id: String = row.get(1)?;
            let chapter: i32 = row.get(2)?;
            let verse: i32 = row.get(3)?;
            let text: String = row.get(4)?;
            let vector_bytes: Vec<u8> = row.get(5)?;
            Ok((id, book_id, chapter, verse, text, vector_bytes))
        })
        .map_err(|e| e.to_string())?;

    for row in rows {
        let (id, book_id, chapter, verse, text, vector_bytes) = row.map_err(|e| e.to_string())?;
        
        // Fast float slice conversion from raw binary BLOB
        if vector_bytes.len() % 4 == 0 {
            let verse_vector: &[f32] = unsafe {
                std::slice::from_raw_parts(
                    vector_bytes.as_ptr() as *const f32,
                    vector_bytes.len() / 4,
                )
            };

            let similarity = cosine_similarity(&query_vector, verse_vector);
            verses_with_scores.push(SemanticResultDto {
                id,
                book_id,
                chapter,
                verse,
                text,
                similarity,
            });
        }
    }

    // Sort descending by similarity
    verses_with_scores.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap_or(std::cmp::Ordering::Equal));
    verses_with_scores.truncate(limit_val);

    Ok(verses_with_scores)
}

#[inline]
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let mut dot = 0.0f32;
    let mut norm_a = 0.0f32;
    let mut norm_b = 0.0f32;

    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
        norm_a += x * x;
        norm_b += y * y;
    }

    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a.sqrt() * norm_b.sqrt())
    }
}
