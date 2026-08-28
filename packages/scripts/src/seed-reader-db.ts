import fs from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

interface RawBibleJSON {
  version_id: string;
  version_name: string;
  language: string;
  testaments: {
    [testament: string]: {
      [book: string]: {
        [chapter: string]: string[];
      };
    };
  };
}

async function buildReaderDatabase(dataDir: string, dbOutputPath: string) {
  console.log(`🔨 Creating Reader SQLite DB at: ${dbOutputPath}`);
  
  const db = new DatabaseSync(dbOutputPath);

  // Initialize schema for ultra-fast reader access
  db.exec(`
    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      language TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      testament TEXT NOT NULL,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verses (
      version_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (version_id, book_id, chapter, verse),
      FOREIGN KEY (version_id) REFERENCES versions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_chapter_read 
    ON verses (version_id, book_id, chapter);
  `);

  const insertVersion = db.prepare(
    'INSERT OR REPLACE INTO versions (id, name, language) VALUES (?, ?, ?)'
  );
  const insertBook = db.prepare(
    'INSERT OR IGNORE INTO books (id, testament, name, order_index) VALUES (?, ?, ?, ?)'
  );
  const insertVerse = db.prepare(
    'INSERT OR REPLACE INTO verses (version_id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)'
  );

  const files = await fs.readdir(dataDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json') && !f.startsWith('.'));

  let globalBookIndex = 0;
  const processedBooks = new Set<string>();

  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    console.log(`📖 Processing translation: ${file}...`);
    const raw: RawBibleJSON = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    insertVersion.run(raw.version_id, raw.version_name, raw.language);

    db.exec('BEGIN TRANSACTION');
    for (const [testament, books] of Object.entries(raw.testaments)) {
      for (const [bookName, chapters] of Object.entries(books)) {
        const bookId = bookName.toUpperCase().replace(/\s+/g, '_');
        
        if (!processedBooks.has(bookId)) {
          insertBook.run(bookId, testament, bookName, ++globalBookIndex);
          processedBooks.add(bookId);
        }

        for (const [chapterStr, verses] of Object.entries(chapters)) {
          const chapterNum = parseInt(chapterStr, 10);
          verses.forEach((verseText, idx) => {
            const verseNum = idx + 1;
            insertVerse.run(raw.version_id, bookId, chapterNum, verseNum, verseText);
          });
        }
      }
    }
    db.exec('COMMIT');
    console.log(`✅ Loaded ${raw.version_id} into Reader DB.`);
  }

  console.log('🎉 Reader DB successfully generated!');
}

const rootDir = path.resolve(import.meta.dirname, '../../..');
const dataDir = path.join(rootDir, '.agents/data/json');
const dbPath = path.join(rootDir, 'bible_reader.db');
buildReaderDatabase(dataDir, dbPath);
