import { CANONICAL_BOOKS } from './langs.js';
import type { Chapter, ChapterVerse } from './types.js';

export interface RawBibleJSON {
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

const loadedBibles = new Map<string, RawBibleJSON>();

/**
 * Dynamically loads a Bible translation JSON dataset.
 */
export async function loadBibleData(versionId: string): Promise<RawBibleJSON | null> {
  if (loadedBibles.has(versionId)) {
    return loadedBibles.get(versionId)!;
  }

  try {
    let data: RawBibleJSON | null = null;

    // Direct static imports for known versions to support bundlers cleanly
    switch (versionId) {
      case 'fr_lsg': {
        const mod = await import('../../../.agents/data/json/fr_lsg.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'fr_ost': {
        const mod = await import('../../../.agents/data/json/fr_ost.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'fr_mar': {
        const mod = await import('../../../.agents/data/json/fr_mar.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'fr_apee': {
        const mod = await import('../../../.agents/data/json/fr_apee.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'en_kjv': {
        const mod = await import('../../../.agents/data/json/en_kjv.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'en_bsb': {
        const mod = await import('../../../.agents/data/json/en_bsb.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'en_web': {
        const mod = await import('../../../.agents/data/json/en_web.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'en_ylt': {
        const mod = await import('../../../.agents/data/json/en_ylt.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'en_bbe': {
        const mod = await import('../../../.agents/data/json/en_bbe.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      case 'en_asv': {
        const mod = await import('../../../.agents/data/json/en_asv.json', { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
      default: {
        const mod = await import(`../../../.agents/data/json/${versionId}.json`, { with: { type: 'json' } });
        data = (mod.default || mod) as unknown as RawBibleJSON;
        break;
      }
    }

    if (data) {
      loadedBibles.set(versionId, data);
      return data;
    }
  } catch (err) {
    console.error(`Failed to load Bible JSON for ${versionId}:`, err);
  }

  return null;
}

/**
 * Retrieves chapter verses directly from the Bible JSON without SQLite.
 */
export async function getChapterFromData(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<Chapter | null> {
  const bible = await loadBibleData(versionId);
  if (!bible) return null;

  const normalizedId = bookId.toUpperCase().replace(/\s+/g, '_');
  const canonicalMeta = CANONICAL_BOOKS.find((b) => b.bookId === normalizedId);
  if (!canonicalMeta) return null;

  const testamentBooks = bible.testaments[canonicalMeta.testament];
  if (!testamentBooks) return null;

  const bookData =
    testamentBooks[canonicalMeta.canonicalName] ||
    testamentBooks[Object.keys(testamentBooks).find((k) => k.toUpperCase().replace(/\s+/g, '_') === normalizedId) || ''];

  if (!bookData) return null;

  const verseTexts: string[] = bookData[String(chapter)] || [];
  const verses: ChapterVerse[] = verseTexts.map((text, idx) => ({
    verse: idx + 1,
    text,
  }));

  return {
    version_id: versionId,
    book_id: canonicalMeta.bookId,
    chapter,
    verses,
  };
}
