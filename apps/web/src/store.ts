import { createSignal } from 'solid-js';

export type ReaderTheme = 'sepia' | 'light' | 'dark' | 'oled';

export const [currentVersion, setCurrentVersion] = createSignal<string>('fr_lsg');
export const [fontSize, setFontSize] = createSignal<number>(19);
export const [theme, setTheme] = createSignal<ReaderTheme>('sepia');
export const [isSearchOpen, setIsSearchOpen] = createSignal<boolean>(false);
export const [isSettingsOpen, setIsSettingsOpen] = createSignal<boolean>(false);

export function cycleTheme() {
  const themes: ReaderTheme[] = ['sepia', 'light', 'dark', 'oled'];
  const nextIdx = (themes.indexOf(theme()) + 1) % themes.length;
  setTheme(themes[nextIdx]);
  document.documentElement.setAttribute('data-theme', themes[nextIdx]);
}

export function increaseFontSize() {
  setFontSize((prev) => Math.min(prev + 2, 32));
  document.documentElement.style.setProperty('--font-size', `${fontSize()}px`);
}

export function decreaseFontSize() {
  setFontSize((prev) => Math.max(prev - 2, 14));
  document.documentElement.style.setProperty('--font-size', `${fontSize()}px`);
}
