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

export function getInitialLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (
        stored === 'en' ||
        stored === 'fr' ||
        stored === 'es' ||
        stored === 'de' ||
        stored === 'pt'
      ) {
        return stored;
      }
    } catch {
      // LocalStorage might be disabled or unavailable
    }
  }
  return 'en';
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

const initialLang = getInitialLanguage();
const initialVer = getDefaultVersionForLanguage(initialLang);

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

export function cycleTheme() {
  const themes: ReaderTheme[] = [
    'sepia',
    'light',
    'dark',
    'oled',
    'soft-blue',
    'lightgray',
  ];
  const nextIdx = (themes.indexOf(theme()) + 1) % themes.length;
  setTheme(themes[nextIdx]);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themes[nextIdx]);
  }
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
