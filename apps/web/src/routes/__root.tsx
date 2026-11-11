/// <reference types="vite/client" />

import {
  getAvailableLanguages,
  getVersionsForLanguage,
  getLanguageForVersion,
  getDefaultVersionForLanguage,
  getBooksList,
  getBookById,
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
import { createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { HydrationScript } from 'solid-js/web';

import { SearchModal } from '../components/SearchModal.js';
import {
  currentLanguage,
  setCurrentLanguage,
  currentVersion,
  setCurrentVersion,
  theme,
  THEMES,
  selectTheme,
  isSearchOpen,
  setIsSearchOpen,
  cycleTheme,
  increaseFontSize,
  decreaseFontSize,
  type ReaderTheme,
} from '../store.js';

import appCss from '../styles/app.css?url';

export const Route = createRootRoute({
  // The app is client-rendered: no route markup is generated on the server.
  ssr: false,

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

    /**
     * The whole layout is rendered on the client only. This keeps the
     * prerendered shell free of language-dependent markup (selectors, book
     * names, labels), so the app can start directly in the user's preferred
     * language without a hydration mismatch.
     */
    const [mounted, setMounted] = createSignal(false);
    onMount(() => setMounted(true));

    const [isThemeMenuOpen, setIsThemeMenuOpen] = createSignal(false);
    let themeMenuRef: HTMLDivElement | undefined;

    // Toggle search with Cmd+K / Ctrl+K
    onMount(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setIsSearchOpen(prev => !prev);
        }
        if (e.key === 'Escape') {
          setIsThemeMenuOpen(false);
        }
      };
      const handleGlobalClick = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!themeMenuRef?.contains(target)) {
          setIsThemeMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      document.addEventListener('click', handleGlobalClick);
      onCleanup(() => {
        window.removeEventListener('keydown', handleGlobalKeyDown);
        document.removeEventListener('click', handleGlobalClick);
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

    const activeChapter = () => Number(routeInfo().chapter) || 1;

    const chapterCount = () =>
      getBookById(routeInfo().book, activeLanguage())?.totalChapters ?? 0;

    const chapters = () =>
      Array.from({ length: chapterCount() }, (_, index) => index + 1);

    const handleChapterChange = (chapter: string) => {
      const info = routeInfo();
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: { version: activeVersion(), book: info.book, chapter },
      });
    };

    const themeLabels: Record<ReaderTheme, string> = {
      sepia: 'Sepia',
      light: 'Light',
      dark: 'Dark',
      oled: 'OLED',
      'soft-blue': 'Soft blue',
      lightgray: 'Light gray',
    };

    const themeLabel = (item: ReaderTheme) => themeLabels[item];

    const handleThemeSelect = (next: ReaderTheme) => {
      selectTheme(next);
      setIsThemeMenuOpen(false);
    };

    const controlBtnClass =
      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-(--border-color) bg-transparent text-(--text-color) text-sm cursor-pointer hover:bg-(--hover-bg) transition-colors focus:outline-none';

    return (
      <Show when={mounted()}>
        <div class='min-h-screen'>
          <header class='fixed top-0 right-0 left-0 z-50 flex h-15 items-center justify-between border-b border-(--border-color) bg-(--header-bg) px-6 backdrop-blur-md transition-colors'>
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

              {/* Chapter Selector */}
              <select
                class={controlBtnClass}
                value={String(activeChapter())}
                onChange={e => handleChapterChange(e.currentTarget.value)}
                title={translateToken('chapter', activeLanguage(), 'Chapter')}
              >
                <For each={chapters()}>
                  {chapter => (
                    <option
                      value={String(chapter)}
                      class='bg-(--bg-color) text-(--text-color)'
                      selected={chapter === activeChapter()}
                    >
                      {chapter}
                    </option>
                  )}
                </For>
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
              <div class='inline-flex items-stretch rounded-md border border-(--border-color) bg-transparent'>
                <button
                  class='inline-flex cursor-pointer items-center gap-1.5 rounded-l-md px-3.5 py-1.5 text-sm font-medium text-(--text-color) transition duration-150 hover:bg-(--hover-bg) focus:outline-none active:scale-90'
                  onClick={cycleTheme}
                  title={translateToken(
                    'change_theme',
                    activeLanguage(),
                    'Change Theme',
                  )}
                >
                  🎨 {theme().toUpperCase()}
                </button>
                <span
                  class='w-px shrink-0 bg-(--border-color)'
                  aria-hidden='true'
                />
                <div class='relative flex' ref={el => (themeMenuRef = el)}>
                  <button
                    class='inline-flex cursor-pointer items-center rounded-r-md px-3 py-1.5 text-sm text-(--text-color) transition duration-150 hover:bg-(--hover-bg) focus:outline-none active:scale-90'
                    onClick={() => setIsThemeMenuOpen(prev => !prev)}
                    title={translateToken(
                      'change_theme',
                      activeLanguage(),
                      'Change Theme',
                    )}
                    aria-haspopup='listbox'
                    aria-expanded={isThemeMenuOpen()}
                  >
                    🔽
                  </button>
                  <Show when={isThemeMenuOpen()}>
                    <div
                      class='absolute top-full right-0 z-50 mt-1 min-w-36 overflow-hidden rounded-md border border-(--border-color) bg-(--bg-color) py-1 shadow-lg'
                      role='listbox'
                    >
                      <For each={THEMES}>
                        {item => (
                          <button
                            class='flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left text-sm text-(--text-color) transition-colors hover:bg-(--hover-bg)'
                            role='option'
                            aria-selected={theme() === item}
                            onClick={() => handleThemeSelect(item)}
                          >
                            <span>{themeLabel(item)}</span>
                            <Show when={theme() === item}>
                              <span aria-hidden='true'>✓</span>
                            </Show>
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </header>

          <main>
            <Outlet />
          </main>

          <SearchModal />
        </div>
      </Show>
    );
  },
});
