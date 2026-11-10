import { createSignal } from 'solid-js';
import {
  type SupportedLanguage,
  translateToken,
  getVersionsForLanguage,
  getLanguageForVersion,
  getDefaultVersionForLanguage,
} from '@bemedev/bible';

export type ReaderTheme =
  | 'sepia'
  | 'light'
  | 'dark'
  | 'oled'
  | 'soft-blue'
  | 'lightgray';

const LANG_STORAGE_KEY = 'bible_language';

/** Fallback when neither a saved choice nor a supported browser language exists. */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'fr',
  'es',
  'de',
  'pt',
];

function isSupportedLanguage(
  code: string | undefined,
): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

/** Reads the language persisted by a previous session. Client-only. */
export function getPersistedLanguage(): SupportedLanguage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored =
        window.localStorage.getItem(LANG_STORAGE_KEY) ?? undefined;
      if (isSupportedLanguage(stored)) {
        return stored;
      }
    } catch {
      // LocalStorage might be disabled or unavailable
    }
  }
  return null;
}

/**
 * Picks the first supported language among the user's browser preferences (e.g.
 * `navigator.languages`). Client-only.
 */
export function getPreferredLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const preferred =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const tag of preferred) {
    const code = tag?.toLowerCase().split('-')[0];
    if (isSupportedLanguage(code)) return code;
  }

  return null;
}

/**
 * Runtime language, in priority order: the explicit choice saved by the user,
 * the browser's preferred language, then the fallback default.
 */
export function getInitialLanguage(): SupportedLanguage {
  return (
    getPersistedLanguage() ?? getPreferredLanguage() ?? DEFAULT_LANGUAGE
  );
}

export function persistLanguage(lang: SupportedLanguage) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // LocalStorage might be disabled or unavailable
    }
  }
}

/**
 * The app is client-rendered (SPA): signals can be initialized straight from the
 * user's saved/browser preference, with no server markup to stay in sync with.
 */
const initialLang = getInitialLanguage();
const initialVer = getDefaultVersionForLanguage(initialLang);

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', initialLang);
}

export const [currentLanguage, _setCurrentLanguage] =
  createSignal<SupportedLanguage>(initialLang);
export const [currentVersion, setCurrentVersion] =
  createSignal<string>(initialVer);
export const [fontSize, setFontSize] = createSignal<number>(19);
export const [theme, setTheme] = createSignal<ReaderTheme>('sepia');
export const [isSearchOpen, setIsSearchOpen] = createSignal<boolean>(false);
export const [isSettingsOpen, setIsSettingsOpen] = createSignal<boolean>(false);

export function setCurrentLanguage(lang: SupportedLanguage) {
  _setCurrentLanguage(lang);
  persistLanguage(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lang);
  }
}

export function setLanguageAndDefaultVersion(lang: SupportedLanguage) {
  setCurrentLanguage(lang);
  const versions = getVersionsForLanguage(lang);
  if (versions.length > 0 && !versions.some(v => v.id === currentVersion())) {
    setCurrentVersion(versions[0].id);
  }
}

export function setVersionAndSyncLanguage(versionId: string) {
  setCurrentVersion(versionId);
  const lang = getLanguageForVersion(versionId);
  if (lang !== currentLanguage()) {
    setCurrentLanguage(lang);
  }
}

export function t(key: string, fallback?: string): string {
  return translateToken(key, currentLanguage(), fallback);
}

export const THEMES: readonly ReaderTheme[] = [
  'sepia',
  'light',
  'dark',
  'oled',
  'soft-blue',
  'lightgray',
];

/** Applies a specific theme and updates the document attribute. */
export function selectTheme(next: ReaderTheme) {
  setTheme(next);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', next);
  }
}

export function cycleTheme() {
  const nextIdx = (THEMES.indexOf(theme()) + 1) % THEMES.length;
  selectTheme(THEMES[nextIdx]);
}

export function increaseFontSize() {
  setFontSize((prev) => Math.min(prev + 2, 32));
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--font-size', `${fontSize()}px`);
  }
}

export function decreaseFontSize() {
  setFontSize((prev) => Math.max(prev - 2, 14));
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--font-size', `${fontSize()}px`);
  }
}
