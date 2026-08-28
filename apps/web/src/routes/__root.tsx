/// <reference types="vite/client" />

import {
  getAvailableLanguages,
  getVersionsForLanguage,
  getLanguageForVersion,
  getDefaultVersionForLanguage,
  getBooksList,
  type SupportedLanguage,
} from '@bemedev/bible';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useNavigate,
} from '@tanstack/solid-router';
import { createEffect, For } from 'solid-js';
import { HydrationScript } from 'solid-js/web';

import { SearchModal } from '../components/SearchModal.js';
import {
  currentLanguage,
  setCurrentLanguage,
  currentVersion,
  setCurrentVersion,
  theme,
  isSearchOpen,
  setIsSearchOpen,
  cycleTheme,
  increaseFontSize,
  decreaseFontSize,
  t,
} from '../store.js';

import appCss from '../styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Bible - Reader & Semantic Search' },
    ],
  }),

  shellComponent: ({ children }) => {
    return (
      <html lang="en" data-theme={theme()}>
        <head>
          <HydrationScript />
          <HeadContent />
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    );
  },

  component: () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Synchronize language and version state with the current URL on load and route changes
    createEffect(() => {
      const parts = location().pathname.split('/').filter(Boolean);
      if (parts[0] === 'reader' && parts[1]) {
        const urlVersion = parts[1];
        const urlLanguage = getLanguageForVersion(urlVersion);
        if (currentVersion() !== urlVersion) {
          setCurrentVersion(urlVersion);
        }
        if (currentLanguage() !== urlLanguage) {
          setCurrentLanguage(urlLanguage);
        }
      }
    });

    // Only display languages where Bible translations are available
    const availableLanguages = () => getAvailableLanguages();

    // Only display versions belonging to the active language
    const availableVersions = () => getVersionsForLanguage(currentLanguage());

    const books = () => getBooksList(currentLanguage());

    const oldTestamentBooks = () =>
      books().filter((b) => b.testament === 'Old Testament');
    const newTestamentBooks = () =>
      books().filter((b) => b.testament === 'New Testament');

    const routeInfo = () => {
      const parts = location().pathname.split('/').filter(Boolean);
      if (parts[0] === 'reader' && parts.length >= 4) {
        return {
          version: parts[1] || currentVersion(),
          book: parts[2] || 'GENESIS',
          chapter: parts[3] || '1',
        };
      }
      return { version: currentVersion(), book: 'GENESIS', chapter: '1' };
    };

    const handleLanguageChange = (lang: SupportedLanguage) => {
      const newVersion = getDefaultVersionForLanguage(lang);
      setCurrentLanguage(lang);
      setCurrentVersion(newVersion);
      const info = routeInfo();
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: {
          version: newVersion,
          book: info.book,
          chapter: info.chapter,
        },
      });
    };

    const handleVersionChange = (version: string) => {
      const newLang = getLanguageForVersion(version);
      setCurrentVersion(version);
      setCurrentLanguage(newLang);
      const info = routeInfo();
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: {
          version,
          book: info.book,
          chapter: info.chapter,
        },
      });
    };

    const handleBookChange = (bookId: string) => {
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: {
          version: currentVersion(),
          book: bookId,
          chapter: '1',
        },
      });
    };

    return (
      <div class="app-root">
        <header class="reader-header">
          <div style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'flex-wrap': 'wrap' }}>
            <span style={{ 'font-weight': 'bold', 'letter-spacing': '0.05em' }}>📖 BIBLE</span>

            {/* Language Selector (only available languages) */}
            <select
              class="btn"
              value={currentLanguage()}
              onChange={(e) => handleLanguageChange(e.currentTarget.value as SupportedLanguage)}
              title={t('language', 'Language')}
            >
              <For each={availableLanguages()}>
                {(l) => <option value={l.code}>{l.name}</option>}
              </For>
            </select>

            {/* Version Selector (filtered to selected language) */}
            <select
              class="btn"
              value={currentVersion()}
              onChange={(e) => handleVersionChange(e.currentTarget.value)}
              title={t('version', 'Version')}
            >
              <For each={availableVersions()}>
                {(v) => <option value={v.id}>{v.name}</option>}
              </For>
            </select>

            {/* Book Selector */}
            <select
              class="btn"
              value={routeInfo().book}
              onChange={(e) => handleBookChange(e.currentTarget.value)}
              title={t('book', 'Book')}
            >
              <optgroup label={t('old_testament', 'Old Testament')}>
                <For each={oldTestamentBooks()}>
                  {(b) => <option value={b.bookId}>{b.translatedName}</option>}
                </For>
              </optgroup>
              <optgroup label={t('new_testament', 'New Testament')}>
                <For each={newTestamentBooks()}>
                  {(b) => <option value={b.bookId}>{b.translatedName}</option>}
                </For>
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
            <button
              class="btn"
              onClick={() => setIsSearchOpen(!isSearchOpen())}
              title={`${t('search', 'Search')} (Cmd+K)`}
            >
              🔍 {t('search', 'Search')}
            </button>
            <button class="btn" onClick={decreaseFontSize} title="Decrease font size">
              A-
            </button>
            <button class="btn" onClick={increaseFontSize} title="Increase font size">
              A+
            </button>
            <button class="btn" onClick={cycleTheme} title="Change Theme">
              🎨 {theme().toUpperCase()}
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>

        <SearchModal />
      </div>
    );
  },
});
