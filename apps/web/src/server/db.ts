import { createServerFn } from '@tanstack/solid-start';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let readerDb: DatabaseSync | null = null;

function getReaderDb(): DatabaseSync | null {
  if (readerDb) return readerDb;

  const candidates = [
    path.resolve('bible_reader.db'),
    path.resolve('../../bible_reader.db'),
    path.resolve('../bible_reader.db'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      readerDb = new DatabaseSync(p);
      return readerDb;
    }
  }

  return null;
}

export const fetchChapterServerFn = createServerFn({ method: 'GET' })
  .validator((params: { version: string; book: string; chapter: number }) => params)
  .handler(async ({ data }) => {
    const db = getReaderDb();
    if (!db) return null;

    const stmt = db.prepare(`
      SELECT verse, text FROM verses
      WHERE version_id = ? AND book_id = ? AND chapter = ?
      ORDER BY verse ASC
    `);

    const rows = stmt.all(data.version, data.book, data.chapter) as {
      verse: number;
      text: string;
    }[];

    return {
      version_id: data.version,
      book_id: data.book,
      chapter: data.chapter,
      verses: rows,
    };
  });
