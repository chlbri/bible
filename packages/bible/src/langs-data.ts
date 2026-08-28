import de from '../../../.agents/data/langs/de.json' with { type: 'json' };
import en from '../../../.agents/data/langs/en.json' with { type: 'json' };
import es from '../../../.agents/data/langs/es.json' with { type: 'json' };
import fr from '../../../.agents/data/langs/fr.json' with { type: 'json' };
import pt from '../../../.agents/data/langs/pt.json' with { type: 'json' };

export type SupportedLanguage = 'de' | 'en' | 'es' | 'fr' | 'pt';

export interface LangTokenMap {
  testaments: string;
  old_testament: string;
  new_testament: string;
  books: string;
  book: string;
  chapters: string;
  chapter: string;
  verses: string;
  verse: string;
  version: string;
  language: string;
  translation: string;
  abbreviation: string;
  table_of_contents: string;
  search?: string;
  previous?: string;
  next?: string;
  meaning?: string;
  keyword?: string;
}

export interface RawBookData {
  id: string;
  canonical_name: string;
  translated_name: string;
  short_name: string;
  abbreviation: string;
  testament_canonical: string;
  testament_translated: string;
  canonical_order: number;
}

export interface RawLangFile {
  language_code: SupportedLanguage;
  language_name: string;
  tokens: Record<string, string>;
  testaments: Record<string, string>;
  books_by_canonical_name: Record<string, RawBookData>;
  books_by_testament: Record<string, RawBookData[]>;
}

export const LANGS_DATA: Record<SupportedLanguage, RawLangFile> = {
  de: de as unknown as RawLangFile,
  en: en as unknown as RawLangFile,
  es: es as unknown as RawLangFile,
  fr: fr as unknown as RawLangFile,
  pt: pt as unknown as RawLangFile,
};

