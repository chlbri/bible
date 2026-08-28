import { create, insertMultiple, search, type AnyOrama } from '@orama/orama';
import { stemmer as frenchStemmer } from '@orama/stemmers/french';
import { stemmer as englishStemmer } from '@orama/stemmers/english';
import { CANONICAL_BOOKS, getBooksList } from './langs.js';
import { loadBibleData, getChapterFromData } from './reader.js';
import type { SupportedLanguage } from './langs-data.js';

export interface VerseDocument {
  id: string;
  version_id: string;
  testament: string;
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  normalized_text: string;
}

export interface OramaSearchResult {
  id: string;
  book_id: string;
  chapter: number;
  verse: number;
  text: string;
  similarity?: number;
  score?: number;
}

const oramaIndices = new Map<string, AnyOrama>();
const buildingIndices = new Map<string, Promise<AnyOrama>>();

/**
 * Removes accents and lowercases string for robust diacritic-insensitive matching.
 */
export function normalizeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Parses a reference query like "Jean 3:16", "Genèse 1:1", "John 3 16", "1 Jean 1:9", "Psaume 23:1".
 */
export function parseBibleReference(
  query: string,
  lang: SupportedLanguage = 'fr'
): { bookId: string; chapter: number; verse?: number } | null {
  const q = query.trim();
  // Regex matching: (optional number 1-3) (Book Name) (chapter) [: ]? (optional verse)
  const match = q.match(/^((?:[1-3]\s+)?[a-zA-Z\u00C0-\u017F\s-]+?)\s+(\d+)(?:[:\s](\d+))?$/i);
  if (!match) return null;

  const rawBook = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : undefined;

  const normalizedBook = normalizeDiacritics(rawBook);
  const booksList = getBooksList(lang);

  const found = booksList.find((b) => {
    const normCanonical = normalizeDiacritics(b.canonicalName);
    const normTranslated = normalizeDiacritics(b.translatedName);
    const normShort = normalizeDiacritics(b.shortName);
    const normAbbr = normalizeDiacritics(b.abbreviation);

    return (
      normTranslated === normalizedBook ||
      normCanonical === normalizedBook ||
      normShort === normalizedBook ||
      normAbbr === normalizedBook ||
      b.bookId.toLowerCase() === normalizedBook.replace(/\s+/g, '_')
    );
  });

  if (!found) return null;
  if (chapter < 1 || chapter > found.totalChapters) return null;

  return {
    bookId: found.bookId,
    chapter,
    verse,
  };
}

/**
 * Creates or retrieves the in-memory Orama search index for a Bible version.
 */
export async function getOrCreateIndex(versionId: string): Promise<AnyOrama | null> {
  if (oramaIndices.has(versionId)) {
    return oramaIndices.get(versionId)!;
  }

  if (buildingIndices.has(versionId)) {
    return buildingIndices.get(versionId)!;
  }

  const buildPromise = (async () => {
    const bible = await loadBibleData(versionId);
    if (!bible) return null;

    const isFrench = versionId.startsWith('fr_');

    const db = await create({
      schema: {
        id: 'string',
        version_id: 'string',
        testament: 'string',
        book_id: 'string',
        book_name: 'string',
        chapter: 'number',
        verse: 'number',
        text: 'string',
        normalized_text: 'string',
      },
      components: {
        tokenizer: {
          stemmer: isFrench ? frenchStemmer : englishStemmer,
        },
      },
    });

    const flatDocs: VerseDocument[] = [];

    for (const [testament, books] of Object.entries(bible.testaments)) {
      for (const [bookName, chapters] of Object.entries(books)) {
        const canonical = CANONICAL_BOOKS.find(
          (b) =>
            b.canonicalName.toLowerCase() === bookName.toLowerCase() ||
            b.bookId === bookName.toUpperCase().replace(/\s+/g, '_')
        );
        const bookId = canonical?.bookId || bookName.toUpperCase().replace(/\s+/g, '_');

        for (const [chapterStr, verses] of Object.entries(chapters)) {
          const chapter = parseInt(chapterStr, 10);
          verses.forEach((text, idx) => {
            const verse = idx + 1;
            flatDocs.push({
              id: `${versionId}_${bookId}_${chapter}_${verse}`,
              version_id: versionId,
              testament,
              book_id: bookId,
              book_name: bookName,
              chapter,
              verse,
              text,
              normalized_text: normalizeDiacritics(text),
            });
          });
        }
      }
    }

    await insertMultiple(db, flatDocs);
    oramaIndices.set(versionId, db);
    buildingIndices.delete(versionId);
    return db;
  })();

  buildingIndices.set(versionId, buildPromise as Promise<AnyOrama>);
  return buildPromise;
}

/**
 * Searches Bible verses using Orama full-text search with direct reference matching and phrase boosting.
 */
export async function searchVerses(
  versionId: string,
  query: string,
  limit = 25
): Promise<OramaSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const lang: SupportedLanguage = versionId.startsWith('fr_') ? 'fr' : 'en';
  const results: OramaSearchResult[] = [];
  const addedIds = new Set<string>();

  // 1. Check if user typed a direct scripture reference (e.g. "Jean 3:16" or "Genèse 1:1")
  const ref = parseBibleReference(q, lang);
  if (ref) {
    const chapterData = await getChapterFromData(versionId, ref.bookId, ref.chapter);
    if (chapterData) {
      if (ref.verse) {
        const targetVerse = chapterData.verses.find((v) => v.verse === ref.verse);
        if (targetVerse) {
          const id = `${versionId}_${ref.bookId}_${ref.chapter}_${ref.verse}`;
          results.push({
            id,
            book_id: ref.bookId,
            chapter: ref.chapter,
            verse: ref.verse,
            text: targetVerse.text,
            similarity: 1.0,
            score: 1000,
          });
          addedIds.add(id);
        }
      } else {
        // Return first few verses of the chapter
        chapterData.verses.slice(0, 5).forEach((v) => {
          const id = `${versionId}_${ref.bookId}_${ref.chapter}_${v.verse}`;
          results.push({
            id,
            book_id: ref.bookId,
            chapter: ref.chapter,
            verse: v.verse,
            text: v.text,
            similarity: 0.95,
            score: 900,
          });
          addedIds.add(id);
        });
      }
    }
  }

  // 2. Query Orama database
  const db = await getOrCreateIndex(versionId);
  if (!db) return results;

  const normalizedQuery = normalizeDiacritics(q);

  // Search normalized terms and raw text
  const searchResponse = await search(db, {
    term: normalizedQuery,
    properties: ['normalized_text', 'text', 'book_name'],
    limit: limit * 2,
    tolerance: 1,
  });

  const queryTerms = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  // Score & sort results with exact phrase & term frequency boosting
  const rankedHits = searchResponse.hits
    .map((hit) => {
      const doc = hit.document as unknown as VerseDocument;
      let score = hit.score || 0;

      // Exact substring match boost
      if (doc.normalized_text.includes(normalizedQuery)) {
        score += 500;
      } else {
        // Count matched terms
        let termMatches = 0;
        for (const term of queryTerms) {
          if (doc.normalized_text.includes(term)) {
            termMatches++;
          }
        }
        score += termMatches * 50;
      }

      return {
        id: doc.id,
        book_id: doc.book_id,
        chapter: doc.chapter,
        verse: doc.verse,
        text: doc.text,
        similarity: Math.min(0.99, Number((score / 600).toFixed(2))),
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  for (const hit of rankedHits) {
    if (!addedIds.has(hit.id)) {
      results.push(hit);
      addedIds.add(hit.id);
      if (results.length >= limit) break;
    }
  }

  return results;
}
