import catalog from '../../../.agents/data/catalog.json' with { type: 'json' };
import type { SupportedLanguage } from './langs-data.js';

export interface VersionCatalogEntry {
  id: string;
  name: string;
  language: string;
  language_code: SupportedLanguage;
  file: string;
  file_size_mb: number;
  ot_books: number;
  nt_books: number;
  total_books: number;
  total_chapters: number;
  total_verses: number;
}

export const VERSIONS_CATALOG: VersionCatalogEntry[] = (catalog as any[]).map((item) => {
  const langCode: SupportedLanguage = item.id.startsWith('fr_') ? 'fr' : 'en';
  return {
    ...item,
    language_code: langCode,
  };
});

/**
 * Returns only the languages that have available Bible version datasets in the catalog.
 */
export function getAvailableLanguages(): { code: SupportedLanguage; name: string }[] {
  const presentCodes = new Set(VERSIONS_CATALOG.map((v) => v.language_code));
  const allLangNames: Record<SupportedLanguage, string> = {
    fr: 'Français',
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    pt: 'Português',
  };

  return Array.from(presentCodes).map((code) => ({
    code,
    name: allLangNames[code] || code,
  }));
}

/**
 * Returns the list of Bible versions available for a given language code.
 */
export function getVersionsForLanguage(langCode: SupportedLanguage | string): VersionCatalogEntry[] {
  return VERSIONS_CATALOG.filter((v) => v.language_code === langCode);
}

/**
 * Returns the default Bible version for a given language.
 */
export function getDefaultVersionForLanguage(langCode: SupportedLanguage | string): string {
  const versions = getVersionsForLanguage(langCode);
  if (versions.length > 0) {
    return versions[0].id;
  }
  return 'fr_lsg';
}

/**
 * Resolves the language code associated with a version ID.
 */
export function getLanguageForVersion(versionId: string): SupportedLanguage {
  const entry = VERSIONS_CATALOG.find((v) => v.id === versionId);
  if (entry) return entry.language_code;
  if (versionId.startsWith('fr_')) return 'fr';
  if (versionId.startsWith('en_')) return 'en';
  return 'fr';
}

