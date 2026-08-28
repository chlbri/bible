/// <reference types="vite/client" />

import {
  getAvailableLanguages,
  getVersionsForLanguage,
  getLanguageForVersion,
  getDefaultVersionForLanguage,
  getBooksList,
  translateToken,
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
import { createEffect, For, onCleanup, onMount } from 'solid-js';
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
      <html lang={currentLanguage()} data-theme={theme()}>
        <head>
          <HydrationScript />
          <HeadContent />
        </head>
        <body class='min-h-screen bg-(--bg-color) text-(length:--font-size) leading-(--line-height) text-(--text-color) antialiased transition-colors duration-200'>
          {children}
          <Scripts />
        </body>
      </html>
    );
  },

  component: () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Toggle search with Cmd+K / Ctrl+K
    onMount(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setIsSearchOpen(prev => !prev);
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      onCleanup(() => {
        window.removeEventListener('keydown', handleGlobalKeyDown);
      });
    });

    const routeInfo = () => {
      const parts = location().pathname.split('/').filter(Boolean);
      if (parts[0] === 'reader' && parts.length >= 2) {
        return {
          version: parts[1] || currentVersion(),
          book: parts[2] || 'GENESIS',
          chapter: parts[3] || '1',
        };
      }
      return { version: currentVersion(), book: 'GENESIS', chapter: '1' };
    };

    const activeLanguage = () => {
      const info = routeInfo();
      if (info.version) {
        return getLanguageForVersion(info.version);
      }
      return currentLanguage();
    };

    const activeVersion = () => {
      const info = routeInfo();
      return info.version || currentVersion();
    };

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
    const availableVersions = () => getVersionsForLanguage(activeLanguage());

    const books = () => getBooksList(activeLanguage());

    const oldTestamentBooks = () =>
      books().filter(b => b.testament === 'Old Testament');
    const newTestamentBooks = () =>
      books().filter(b => b.testament === 'New Testament');

    const handleLanguageChange = (lang: SupportedLanguage) => {
      const newVersion = getDefaultVersionForLanguage(lang);
      setCurrentLanguage(lang);
      setCurrentVersion(newVersion);
      const info = routeInfo();
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: { version: newVersion, book: info.book, chapter: info.chapter },
      });
    };

    const handleVersionChange = (version: string) => {
      const newLang = getLanguageForVersion(version);
      setCurrentVersion(version);
      setCurrentLanguage(newLang);
      const info = routeInfo();
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: { version, book: info.book, chapter: info.chapter },
      });
    };

    const handleBookChange = (bookId: string) => {
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: { version: activeVersion(), book: bookId, chapter: '1' },
      });
    };

    const controlBtnClass =
      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[var(--border-color)] bg-transparent text-[var(--text-color)] text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none';

    return (
      <div class='min-h-screen'>
        <header class='fixed top-0 right-0 left-0 z-50 flex h-[60px] items-center justify-between border-b border-(--border-color) bg-(--header-bg) px-6 backdrop-blur-md transition-colors'>
          <div class='flex flex-wrap items-center gap-2.5'>
            <span class='text-base font-bold tracking-wider select-none'>
              📖 BIBLE
            </span>

            {/* Language Selector (only available languages) */}
            <select
              class={controlBtnClass}
              value={activeLanguage()}
              onChange={e =>
                handleLanguageChange(e.currentTarget.value as SupportedLanguage)
              }
              title={translateToken('language', activeLanguage(), 'Language')}
            >
              <For each={availableLanguages()}>
                {l => (
                  <option
                    value={l.code}
                    class='text-(--text-color)'
                    selected={l.code === activeLanguage()}
                  >
                    {l.name}
                  </option>
                )}
              </For>
            </select>

            {/* Version Selector (filtered to selected language) */}
            <select
              class={controlBtnClass}
              value={activeVersion()}
              onChange={e => handleVersionChange(e.currentTarget.value)}
              title={translateToken('version', activeLanguage(), 'Version')}
            >
              <For each={availableVersions()}>
                {v => (
                  <option
                    value={v.id}
                    class='bg-(--bg-color) text-(--text-color)'
                    selected={v.id === activeVersion()}
                  >
                    {v.name}
                  </option>
                )}
              </For>
            </select>

            {/* Book Selector */}
            <select
              class={controlBtnClass}
              value={routeInfo().book}
              onChange={e => handleBookChange(e.currentTarget.value)}
              title={translateToken('book', activeLanguage(), 'Book')}
            >
              <optgroup
                label={translateToken(
                  'old_testament',
                  activeLanguage(),
                  'Old Testament',
                )}
              >
                <For each={oldTestamentBooks()}>
                  {b => (
                    <option
                      value={b.bookId}
                      class='bg-(--bg-color) text-(--text-color)'
                      selected={b.bookId === routeInfo().book}
                    >
                      {b.translatedName}
                    </option>
                  )}
                </For>
              </optgroup>
              <optgroup
                label={translateToken(
                  'new_testament',
                  activeLanguage(),
                  'New Testament',
                )}
              >
                <For each={newTestamentBooks()}>
                  {b => (
                    <option
                      value={b.bookId}
                      class='bg-(--bg-color) text-(--text-color)'
                      selected={b.bookId === routeInfo().book}
                    >
                      {b.translatedName}
                    </option>
                  )}
                </For>
              </optgroup>
            </select>
          </div>

          <div class='flex items-center gap-2'>
            <button
              class={controlBtnClass}
              onClick={() => setIsSearchOpen(!isSearchOpen())}
              title={`${translateToken('search', activeLanguage(), 'Search')} (Cmd+K)`}
            >
              🔍 {translateToken('search', activeLanguage(), 'Search')}
            </button>
            <button
              class={controlBtnClass}
              onClick={decreaseFontSize}
              title={translateToken(
                'decrease_font_size',
                activeLanguage(),
                'Decrease font size',
              )}
            >
              A-
            </button>
            <button
              class={controlBtnClass}
              onClick={increaseFontSize}
              title={translateToken(
                'increase_font_size',
                activeLanguage(),
                'Increase font size',
              )}
            >
              A+
            </button>
            <button
              class={`${controlBtnClass} font-medium`}
              onClick={cycleTheme}
              title={translateToken(
                'change_theme',
                activeLanguage(),
                'Change Theme',
              )}
            >
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
