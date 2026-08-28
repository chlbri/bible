import {
  LANGS_DATA,
  type SupportedLanguage,
  type RawBookData,
} from './langs-data.js';

export { type SupportedLanguage, LANGS_DATA } from './langs-data.js';

export interface CanonicalBookMeta {
  orderIndex: number;
  bookId: string;
  canonicalName: string;
  testament: 'Old Testament' | 'New Testament';
  totalChapters: number;
}

export const CANONICAL_BOOKS: CanonicalBookMeta[] = [
  {
    orderIndex: 1,
    bookId: 'GENESIS',
    canonicalName: 'Genesis',
    testament: 'Old Testament',
    totalChapters: 50,
  },
  {
    orderIndex: 2,
    bookId: 'EXODUS',
    canonicalName: 'Exodus',
    testament: 'Old Testament',
    totalChapters: 40,
  },
  {
    orderIndex: 3,
    bookId: 'LEVITICUS',
    canonicalName: 'Leviticus',
    testament: 'Old Testament',
    totalChapters: 27,
  },
  {
    orderIndex: 4,
    bookId: 'NUMBERS',
    canonicalName: 'Numbers',
    testament: 'Old Testament',
    totalChapters: 36,
  },
  {
    orderIndex: 5,
    bookId: 'DEUTERONOMY',
    canonicalName: 'Deuteronomy',
    testament: 'Old Testament',
    totalChapters: 34,
  },
  {
    orderIndex: 6,
    bookId: 'JOSHUA',
    canonicalName: 'Joshua',
    testament: 'Old Testament',
    totalChapters: 24,
  },
  {
    orderIndex: 7,
    bookId: 'JUDGES',
    canonicalName: 'Judges',
    testament: 'Old Testament',
    totalChapters: 21,
  },
  {
    orderIndex: 8,
    bookId: 'RUTH',
    canonicalName: 'Ruth',
    testament: 'Old Testament',
    totalChapters: 4,
  },
  {
    orderIndex: 9,
    bookId: '1_SAMUEL',
    canonicalName: '1 Samuel',
    testament: 'Old Testament',
    totalChapters: 31,
  },
  {
    orderIndex: 10,
    bookId: '2_SAMUEL',
    canonicalName: '2 Samuel',
    testament: 'Old Testament',
    totalChapters: 24,
  },
  {
    orderIndex: 11,
    bookId: '1_KINGS',
    canonicalName: '1 Kings',
    testament: 'Old Testament',
    totalChapters: 22,
  },
  {
    orderIndex: 12,
    bookId: '2_KINGS',
    canonicalName: '2 Kings',
    testament: 'Old Testament',
    totalChapters: 25,
  },
  {
    orderIndex: 13,
    bookId: '1_CHRONICLES',
    canonicalName: '1 Chronicles',
    testament: 'Old Testament',
    totalChapters: 29,
  },
  {
    orderIndex: 14,
    bookId: '2_CHRONICLES',
    canonicalName: '2 Chronicles',
    testament: 'Old Testament',
    totalChapters: 36,
  },
  {
    orderIndex: 15,
    bookId: 'EZRA',
    canonicalName: 'Ezra',
    testament: 'Old Testament',
    totalChapters: 10,
  },
  {
    orderIndex: 16,
    bookId: 'NEHEMIAH',
    canonicalName: 'Nehemiah',
    testament: 'Old Testament',
    totalChapters: 13,
  },
  {
    orderIndex: 17,
    bookId: 'ESTHER',
    canonicalName: 'Esther',
    testament: 'Old Testament',
    totalChapters: 10,
  },
  {
    orderIndex: 18,
    bookId: 'JOB',
    canonicalName: 'Job',
    testament: 'Old Testament',
    totalChapters: 42,
  },
  {
    orderIndex: 19,
    bookId: 'PSALMS',
    canonicalName: 'Psalms',
    testament: 'Old Testament',
    totalChapters: 150,
  },
  {
    orderIndex: 20,
    bookId: 'PROVERBS',
    canonicalName: 'Proverbs',
    testament: 'Old Testament',
    totalChapters: 31,
  },
  {
    orderIndex: 21,
    bookId: 'ECCLESIASTES',
    canonicalName: 'Ecclesiastes',
    testament: 'Old Testament',
    totalChapters: 12,
  },
  {
    orderIndex: 22,
    bookId: 'SONG_OF_SOLOMON',
    canonicalName: 'Song of Solomon',
    testament: 'Old Testament',
    totalChapters: 8,
  },
  {
    orderIndex: 23,
    bookId: 'ISAIAH',
    canonicalName: 'Isaiah',
    testament: 'Old Testament',
    totalChapters: 66,
  },
  {
    orderIndex: 24,
    bookId: 'JEREMIAH',
    canonicalName: 'Jeremiah',
    testament: 'Old Testament',
    totalChapters: 52,
  },
  {
    orderIndex: 25,
    bookId: 'LAMENTATIONS',
    canonicalName: 'Lamentations',
    testament: 'Old Testament',
    totalChapters: 5,
  },
  {
    orderIndex: 26,
    bookId: 'EZEKIEL',
    canonicalName: 'Ezekiel',
    testament: 'Old Testament',
    totalChapters: 48,
  },
  {
    orderIndex: 27,
    bookId: 'DANIEL',
    canonicalName: 'Daniel',
    testament: 'Old Testament',
    totalChapters: 12,
  },
  {
    orderIndex: 28,
    bookId: 'HOSEA',
    canonicalName: 'Hosea',
    testament: 'Old Testament',
    totalChapters: 14,
  },
  {
    orderIndex: 29,
    bookId: 'JOEL',
    canonicalName: 'Joel',
    testament: 'Old Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 30,
    bookId: 'AMOS',
    canonicalName: 'Amos',
    testament: 'Old Testament',
    totalChapters: 9,
  },
  {
    orderIndex: 31,
    bookId: 'OBADIAH',
    canonicalName: 'Obadiah',
    testament: 'Old Testament',
    totalChapters: 1,
  },
  {
    orderIndex: 32,
    bookId: 'JONAH',
    canonicalName: 'Jonah',
    testament: 'Old Testament',
    totalChapters: 4,
  },
  {
    orderIndex: 33,
    bookId: 'MICAH',
    canonicalName: 'Micah',
    testament: 'Old Testament',
    totalChapters: 7,
  },
  {
    orderIndex: 34,
    bookId: 'NAHUM',
    canonicalName: 'Nahum',
    testament: 'Old Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 35,
    bookId: 'HABAKKUK',
    canonicalName: 'Habakkuk',
    testament: 'Old Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 36,
    bookId: 'ZEPHANIAH',
    canonicalName: 'Zephaniah',
    testament: 'Old Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 37,
    bookId: 'HAGGAI',
    canonicalName: 'Haggai',
    testament: 'Old Testament',
    totalChapters: 2,
  },
  {
    orderIndex: 38,
    bookId: 'ZECHARIAH',
    canonicalName: 'Zechariah',
    testament: 'Old Testament',
    totalChapters: 14,
  },
  {
    orderIndex: 39,
    bookId: 'MALACHI',
    canonicalName: 'Malachi',
    testament: 'Old Testament',
    totalChapters: 4,
  },
  {
    orderIndex: 40,
    bookId: 'MATTHEW',
    canonicalName: 'Matthew',
    testament: 'New Testament',
    totalChapters: 28,
  },
  {
    orderIndex: 41,
    bookId: 'MARK',
    canonicalName: 'Mark',
    testament: 'New Testament',
    totalChapters: 16,
  },
  {
    orderIndex: 42,
    bookId: 'LUKE',
    canonicalName: 'Luke',
    testament: 'New Testament',
    totalChapters: 24,
  },
  {
    orderIndex: 43,
    bookId: 'JOHN',
    canonicalName: 'John',
    testament: 'New Testament',
    totalChapters: 21,
  },
  {
    orderIndex: 44,
    bookId: 'ACTS',
    canonicalName: 'Acts',
    testament: 'New Testament',
    totalChapters: 28,
  },
  {
    orderIndex: 45,
    bookId: 'ROMANS',
    canonicalName: 'Romans',
    testament: 'New Testament',
    totalChapters: 16,
  },
  {
    orderIndex: 46,
    bookId: '1_CORINTHIANS',
    canonicalName: '1 Corinthians',
    testament: 'New Testament',
    totalChapters: 16,
  },
  {
    orderIndex: 47,
    bookId: '2_CORINTHIANS',
    canonicalName: '2 Corinthians',
    testament: 'New Testament',
    totalChapters: 13,
  },
  {
    orderIndex: 48,
    bookId: 'GALATIANS',
    canonicalName: 'Galatians',
    testament: 'New Testament',
    totalChapters: 6,
  },
  {
    orderIndex: 49,
    bookId: 'EPHESIANS',
    canonicalName: 'Ephesians',
    testament: 'New Testament',
    totalChapters: 6,
  },
  {
    orderIndex: 50,
    bookId: 'PHILIPPIANS',
    canonicalName: 'Philippians',
    testament: 'New Testament',
    totalChapters: 4,
  },
  {
    orderIndex: 51,
    bookId: 'COLOSSIANS',
    canonicalName: 'Colossians',
    testament: 'New Testament',
    totalChapters: 4,
  },
  {
    orderIndex: 52,
    bookId: '1_THESSALONIANS',
    canonicalName: '1 Thessalonians',
    testament: 'New Testament',
    totalChapters: 5,
  },
  {
    orderIndex: 53,
    bookId: '2_THESSALONIANS',
    canonicalName: '2 Thessalonians',
    testament: 'New Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 54,
    bookId: '1_TIMOTHY',
    canonicalName: '1 Timothy',
    testament: 'New Testament',
    totalChapters: 6,
  },
  {
    orderIndex: 55,
    bookId: '2_TIMOTHY',
    canonicalName: '2 Timothy',
    testament: 'New Testament',
    totalChapters: 4,
  },
  {
    orderIndex: 56,
    bookId: 'TITUS',
    canonicalName: 'Titus',
    testament: 'New Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 57,
    bookId: 'PHILEMON',
    canonicalName: 'Philemon',
    testament: 'New Testament',
    totalChapters: 1,
  },
  {
    orderIndex: 58,
    bookId: 'HEBREWS',
    canonicalName: 'Hebrews',
    testament: 'New Testament',
    totalChapters: 13,
  },
  {
    orderIndex: 59,
    bookId: 'JAMES',
    canonicalName: 'James',
    testament: 'New Testament',
    totalChapters: 5,
  },
  {
    orderIndex: 60,
    bookId: '1_PETER',
    canonicalName: '1 Peter',
    testament: 'New Testament',
    totalChapters: 5,
  },
  {
    orderIndex: 61,
    bookId: '2_PETER',
    canonicalName: '2 Peter',
    testament: 'New Testament',
    totalChapters: 3,
  },
  {
    orderIndex: 62,
    bookId: '1_JOHN',
    canonicalName: '1 John',
    testament: 'New Testament',
    totalChapters: 5,
  },
  {
    orderIndex: 63,
    bookId: '2_JOHN',
    canonicalName: '2 John',
    testament: 'New Testament',
    totalChapters: 1,
  },
  {
    orderIndex: 64,
    bookId: '3_JOHN',
    canonicalName: '3 John',
    testament: 'New Testament',
    totalChapters: 1,
  },
  {
    orderIndex: 65,
    bookId: 'JUDE',
    canonicalName: 'Jude',
    testament: 'New Testament',
    totalChapters: 1,
  },
  {
    orderIndex: 66,
    bookId: 'REVELATION',
    canonicalName: 'Revelation',
    testament: 'New Testament',
    totalChapters: 22,
  },
];

export interface LocalizedBook extends CanonicalBookMeta {
  translatedName: string;
  shortName: string;
  abbreviation: string;
  testamentTranslated: string;
}

export function getLanguages(): { code: SupportedLanguage; name: string }[] {
  return [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
  ];
}

export function getTokens(lang: SupportedLanguage = 'fr'): Record<string, string> {
  const file = LANGS_DATA[lang] || LANGS_DATA.fr;
  return file.tokens || {};
}

export function translateToken(
  tokenKey: string,
  lang: SupportedLanguage = 'fr',
  fallback?: string,
): string {
  const tokens = getTokens(lang);
  return tokens[tokenKey] || fallback || tokenKey;
}

export function getBooksList(lang: SupportedLanguage = 'fr'): LocalizedBook[] {
  const file = LANGS_DATA[lang] || LANGS_DATA.fr;
  return CANONICAL_BOOKS.map(meta => {
    const raw: RawBookData | undefined =
      file.books_by_canonical_name[meta.canonicalName];
    return {
      ...meta,
      translatedName: raw?.translated_name || meta.canonicalName,
      shortName: raw?.short_name || meta.canonicalName,
      abbreviation: raw?.abbreviation || meta.bookId.toLowerCase(),
      testamentTranslated: raw?.testament_translated || meta.testament,
    };
  });
}

export function getBookById(
  bookId: string,
  lang: SupportedLanguage = 'fr',
): LocalizedBook | undefined {
  const normalizedId = bookId.toUpperCase().replace(/\s+/g, '_');
  const meta = CANONICAL_BOOKS.find(b => b.bookId === normalizedId);
  if (!meta) return undefined;
  const file = LANGS_DATA[lang] || LANGS_DATA.fr;
  const raw: RawBookData | undefined =
    file.books_by_canonical_name[meta.canonicalName];
  return {
    ...meta,
    translatedName: raw?.translated_name || meta.canonicalName,
    shortName: raw?.short_name || meta.canonicalName,
    abbreviation: raw?.abbreviation || meta.bookId.toLowerCase(),
    testamentTranslated: raw?.testament_translated || meta.testament,
  };
}

/**
 * Calculates adjacent chapter navigation across book boundaries. - When delta is +1
 * and current chapter reaches totalChapters, goes to next book, chapter 1. - When
 * delta is -1 and current chapter is 1, goes to previous book, last chapter. -
 * Returns null if at the absolute start (Genesis 1) or end (Revelation 22).
 */
export function getAdjacentChapter(
  bookId: string,
  currentChapter: number,
  delta: number,
): { bookId: string; chapter: number } | null {
  const normalizedId = bookId.toUpperCase().replace(/\s+/g, '_');
  const bookIndex = CANONICAL_BOOKS.findIndex(b => b.bookId === normalizedId);
  if (bookIndex === -1) return null;

  const currentBook = CANONICAL_BOOKS[bookIndex];

  if (delta > 0) {
    if (currentChapter < currentBook.totalChapters) {
      return { bookId: currentBook.bookId, chapter: currentChapter + delta };
    }
    // Cross over to next book
    if (bookIndex + 1 < CANONICAL_BOOKS.length) {
      const nextBook = CANONICAL_BOOKS[bookIndex + 1];
      return { bookId: nextBook.bookId, chapter: 1 };
    }
    return null; // At end of Revelation
  } else if (delta < 0) {
    if (currentChapter > 1) {
      return { bookId: currentBook.bookId, chapter: currentChapter + delta };
    }
    // Cross over to previous book
    if (bookIndex > 0) {
      const prevBook = CANONICAL_BOOKS[bookIndex - 1];
      return { bookId: prevBook.bookId, chapter: prevBook.totalChapters };
    }
    return null; // At beginning of Genesis
  }

  return { bookId: currentBook.bookId, chapter: currentChapter };
}
