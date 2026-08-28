import { describe, expect, it } from 'vitest';
import * as bible from './index.js';

describe('bible package exports', () => {
  it('exports tauriBridge namespace', () => {
    expect(bible.tauriBridge).toBeDefined();
    expect(typeof bible.tauriBridge.getChapter).toBe('function');
    expect(typeof bible.tauriBridge.searchSemantic).toBe('function');
    expect(typeof bible.tauriBridge.searchKeywords).toBe('function');
  });

  it('supports multiple languages and tokens from .agents/data/langs', () => {
    const langs = bible.getLanguages();
    expect(langs.map((l) => l.code)).toEqual(['fr', 'en', 'es', 'de', 'pt']);

    expect(bible.translateToken('old_testament', 'fr')).toBe('Ancien Testament');
    expect(bible.translateToken('old_testament', 'en')).toBe('Old Testament');
    expect(bible.translateToken('old_testament', 'de')).toBe('Altes Testament');
    expect(bible.translateToken('old_testament', 'es')).toBe('Antiguo Testamento');
    expect(bible.translateToken('old_testament', 'pt')).toBe('Antigo Testamento');
  });

  it('resolves localized book metadata and canonical lists', () => {
    const genesisFr = bible.getBookById('GENESIS', 'fr');
    expect(genesisFr?.translatedName).toBe('Genèse');
    expect(genesisFr?.totalChapters).toBe(50);

    const genesisEn = bible.getBookById('GENESIS', 'en');
    expect(genesisEn?.translatedName).toBe('Genesis');

    const books = bible.getBooksList('fr');
    expect(books.length).toBe(66);
    expect(books[0].bookId).toBe('GENESIS');
    expect(books[65].bookId).toBe('REVELATION');
  });

  it('handles cross-book chapter boundary navigation correctly', () => {
    // Next chapter within same book
    expect(bible.getAdjacentChapter('GENESIS', 1, 1)).toEqual({ bookId: 'GENESIS', chapter: 2 });
    
    // Next chapter across book boundary (Genesis 50 -> Exodus 1)
    expect(bible.getAdjacentChapter('GENESIS', 50, 1)).toEqual({ bookId: 'EXODUS', chapter: 1 });

    // Previous chapter across book boundary (Exodus 1 -> Genesis 50)
    expect(bible.getAdjacentChapter('EXODUS', 1, -1)).toEqual({ bookId: 'GENESIS', chapter: 50 });

    // At start of Bible (Genesis 1 - 1)
    expect(bible.getAdjacentChapter('GENESIS', 1, -1)).toBeNull();

    // At end of Bible (Revelation 22 + 1)
    expect(bible.getAdjacentChapter('REVELATION', 22, 1)).toBeNull();
  });

  it('filters available languages and versions from catalog', () => {
    const availableLangs = bible.getAvailableLanguages();
    expect(availableLangs.map((l) => l.code).sort()).toEqual(['en', 'fr']);

    const frenchVersions = bible.getVersionsForLanguage('fr');
    expect(frenchVersions.length).toBe(4);
    expect(frenchVersions.map((v) => v.id)).toContain('fr_lsg');
    expect(frenchVersions.map((v) => v.id)).toContain('fr_ost');

    const englishVersions = bible.getVersionsForLanguage('en');
    expect(englishVersions.length).toBe(6);
    expect(englishVersions.map((v) => v.id)).toContain('en_kjv');
    expect(englishVersions.map((v) => v.id)).toContain('en_bsb');
  });

  it('retrieves chapters directly from JSON reader without SQLite', async () => {
    const chapter = await bible.getChapterFromData('fr_lsg', 'GENESIS', 1);
    expect(chapter).toBeDefined();
    expect(chapter?.version_id).toBe('fr_lsg');
    expect(chapter?.book_id).toBe('GENESIS');
    expect(chapter?.chapter).toBe(1);
    expect(chapter?.verses.length).toBe(31);
    expect(chapter?.verses[0].verse).toBe(1);
    expect(chapter?.verses[0].text).toContain('Au commencement');
  });

  it('searches verses with Orama full-text search', async () => {
    const results = await bible.searchVerses('fr_lsg', 'commencement', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.text.toLowerCase().includes('commencement'))).toBe(true);

    const multiWord = await bible.searchVerses('fr_lsg', 'Dieu créa les cieux', 5);
    expect(multiWord.length).toBeGreaterThan(0);
    expect(multiWord[0].book_id).toBe('GENESIS');
    expect(multiWord[0].chapter).toBe(1);
    expect(multiWord[0].verse).toBe(1);

    // Direct scripture reference query
    const refResults = await bible.searchVerses('fr_lsg', 'Jean 3:16', 5);
    expect(refResults.length).toBeGreaterThan(0);
    expect(refResults[0].book_id).toBe('JOHN');
    expect(refResults[0].chapter).toBe(3);
    expect(refResults[0].verse).toBe(16);
    expect(refResults[0].text).toContain('a tant aimé le monde');
  });
});
