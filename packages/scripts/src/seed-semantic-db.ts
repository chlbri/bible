import fs from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

interface OllamaEmbedResponse {
  embeddings?: number[][];
  embedding?: number[];
}

async function getOllamaEmbeddings(
  texts: string[],
  model = 'nomic-embed-text',
  baseUrl = 'http://localhost:11434'
): Promise<number[][]> {
  const res = await fetch(`${baseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  });

  if (!res.ok) {
    // Fallback to legacy single embedding endpoint if /api/embed is not available
    const results: number[][] = [];
    for (const text of texts) {
      const singleRes = await fetch(`${baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: text }),
      });
      const data = (await singleRes.json()) as OllamaEmbedResponse;
      if (data.embedding) results.push(data.embedding);
    }
    return results;
  }

  const data = (await res.json()) as OllamaEmbedResponse;
  return data.embeddings ?? [];
}

async function buildSemanticDatabase(
  jsonFilePath: string,
  dbOutputPath: string,
  model = 'nomic-embed-text'
) {
  console.log(`🔨 Creating Semantic SQLite DB with Ollama (${model})...`);
  const db = new DatabaseSync(dbOutputPath);

  // Initialize schema for FTS5 keyword search and vector embeddings storage
  db.exec(`
    CREATE TABLE IF NOT EXISTS verses_vectors (
      id TEXT PRIMARY KEY,
      version_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      vector BLOB NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
      id UNINDEXED,
      version_id UNINDEXED,
      book_id,
      chapter UNINDEXED,
      verse UNINDEXED,
      text,
      tokenize = 'unicode61 remove_diacritics 2'
    );
  `);

  const insertVector = db.prepare(`
    INSERT OR REPLACE INTO verses_vectors (id, version_id, book_id, chapter, verse, text, vector)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFts = db.prepare(`
    INSERT OR REPLACE INTO verses_fts (id, version_id, book_id, chapter, verse, text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const raw = JSON.parse(await fs.readFile(jsonFilePath, 'utf-8'));
  console.log(`📖 Extracting verses from ${raw.version_id} (${raw.version_name})...`);

  interface VerseItem {
    id: string;
    version_id: string;
    book_id: string;
    chapter: number;
    verse: number;
    text: string;
  }

  const items: VerseItem[] = [];
  for (const books of Object.values(raw.testaments as Record<string, Record<string, Record<string, string[]>>>)) {
    for (const [bookName, chapters] of Object.entries(books)) {
      const bookId = bookName.toUpperCase().replace(/\s+/g, '_');
      for (const [chapterStr, verses] of Object.entries(chapters)) {
        const chapterNum = parseInt(chapterStr, 10);
        verses.forEach((verseText, idx) => {
          const verseNum = idx + 1;
          items.push({
            id: `${raw.version_id}_${bookId}_${chapterNum}_${verseNum}`,
            version_id: raw.version_id,
            book_id: bookId,
            chapter: chapterNum,
            verse: verseNum,
            text: verseText,
          });
        });
      }
    }
  }

  console.log(`Total verses to embed: ${items.length}`);
  const BATCH_SIZE = 32;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const texts = batch.map((v) => `${v.book_id} ${v.chapter}:${v.verse} - ${v.text}`);

    try {
      const embeddings = await getOllamaEmbeddings(texts, model);

      db.exec('BEGIN TRANSACTION');
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const emb = embeddings[j];
        if (!emb) continue;

        // Store vector as compact Float32 binary buffer (BLOB)
        const floatArray = new Float32Array(emb);
        const buffer = Buffer.from(floatArray.buffer);

        insertVector.run(
          item.id,
          item.version_id,
          item.book_id,
          item.chapter,
          item.verse,
          item.text,
          buffer
        );

        insertFts.run(
          item.id,
          item.version_id,
          item.book_id,
          item.chapter,
          item.verse,
          item.text
        );
      }
      db.exec('COMMIT');

      if ((i + BATCH_SIZE) % 512 === 0 || i + BATCH_SIZE >= items.length) {
        console.log(`Embedded and saved ${Math.min(i + BATCH_SIZE, items.length)} / ${items.length} verses`);
      }
    } catch (err) {
      console.error(`Error embedding batch starting at index ${i}:`, err);
      break;
    }
  }

  console.log(`🎉 Semantic DB for ${raw.version_id} generated at: ${dbOutputPath}`);
}

const rootDir = path.resolve(import.meta.dirname, '../../..');
const targetJson = path.join(rootDir, '.agents/data/json/fr_lsg.json');
const outDb = path.join(rootDir, 'bible_semantic.db');
buildSemanticDatabase(targetJson, outDb);
