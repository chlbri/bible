import {
  getBookById,
  searchVerses,
  getLanguageForVersion,
  translateToken,
} from '@bemedev/bible';
import { createDebouncer } from '@tanstack/solid-pacer';
import { useNavigate } from '@tanstack/solid-router';
import { createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';

import { isSearchOpen, setIsSearchOpen, currentVersion } from '../store.js';

/** Don't search until the user has typed at least this many characters. */
const MIN_QUERY_LENGTH = 3;

/** Wait this long after the last keystroke before running the search. */
const SEARCH_DEBOUNCE_MS = 1300;

export function SearchModal() {
  const [query, setQuery] = createSignal('');
  const [mode, setMode] = createSignal<'semantic' | 'keyword'>('semantic');
  const [results, setResults] = createSignal<any[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();

  // Invalidate results from a previous query when a newer one starts.
  let requestId = 0;

  const runSearch = async (term: string) => {
    const id = ++requestId;
    setIsLoading(true);
    try {
      // Pure client-side in-memory Orama search
      const res = await searchVerses(currentVersion(), term, 30);
      if (id === requestId) {
        setResults(res || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      if (id === requestId) {
        setResults([]);
      }
    } finally {
      if (id === requestId) {
        setIsLoading(false);
      }
    }
  };

  // Runs `runSearch` only once the user stops typing for `SEARCH_DEBOUNCE_MS`.
  const debouncer = createDebouncer(
    runSearch,
    { wait: SEARCH_DEBOUNCE_MS },
    state => ({ isPending: state.isPending }),
  );

  const isBusy = () => isLoading() || debouncer.state().isPending;

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen()) {
        e.preventDefault();
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  createEffect(() => {
    const q = query().trim();
    if (q.length < MIN_QUERY_LENGTH) {
      debouncer.cancel();
      requestId++;
      setIsLoading(false);
      setResults([]);
      return;
    }

    debouncer.maybeExecute(q);
  });

  const handleSelectVerse = (bookId: string, chapter: number) => {
    setIsSearchOpen(false);
    navigate({
      to: '/reader/$version/$book/$chapter',
      params: { version: currentVersion(), book: bookId, chapter: String(chapter) },
    });
  };

  const modalLang = () => getLanguageForVersion(currentVersion());

  const getLocalizedBookName = (bookId: string) => {
    const book = getBookById(bookId, modalLang());
    return book?.translatedName || bookId;
  };

  return (
    <Show when={isSearchOpen()}>
      <div
        class='fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-20 backdrop-blur-xs'
        onClick={() => setIsSearchOpen(false)}
      >
        <div
          class='w-full max-w-[640px] overflow-hidden rounded-xl border border-(--border-color) bg-(--bg-color) text-(--text-color) shadow-2xl'
          onClick={e => e.stopPropagation()}
        >
          <div class='flex border-b border-(--border-color) px-3'>
            <input
              type='text'
              class='w-full border-none bg-transparent px-4.5 py-3.5 text-lg text-(--text-color) outline-none'
              placeholder={translateToken(
                'search_placeholder',
                modalLang(),
                'Search by reference (e.g. Jean 3:16) or keywords...',
              )}
              value={query()}
              onInput={e => setQuery(e.currentTarget.value)}
              autofocus
            />
            <div class='flex items-center gap-1.5 px-3'>
              <button
                class='inline-flex min-w-max cursor-pointer items-center gap-1 rounded-md border border-(--border-color) px-3 py-1.5 text-sm transition-colors'
                style={{
                  'background-color':
                    mode() === 'semantic' ? 'var(--accent-color)' : 'transparent',
                  color: mode() === 'semantic' ? '#ffffff' : 'var(--text-color)',
                }}
                onClick={() => setMode('semantic')}
              >
                {translateToken('meaning', modalLang(), 'Meaning')}
              </button>
              <button
                class='inline-flex min-w-max cursor-pointer items-center gap-1 rounded-md border border-(--border-color) px-3 py-1.5 text-sm transition-colors'
                style={{
                  'background-color':
                    mode() === 'keyword' ? 'var(--accent-color)' : 'transparent',
                  color: mode() === 'keyword' ? '#ffffff' : 'var(--text-color)',
                }}
                onClick={() => setMode('keyword')}
              >
                {translateToken('keyword', modalLang(), 'Keyword')}
              </button>
            </div>
          </div>

          <div class='max-h-[400px] overflow-y-auto p-3'>
            <Show when={isBusy()}>
              <div class='py-5 text-center opacity-60'>
                {translateToken(
                  'searching',
                  modalLang(),
                  'Searching across 31,102 verses...',
                )}
              </div>
            </Show>

            <Show
              when={
                !isBusy() &&
                results().length === 0 &&
                query().trim().length >= MIN_QUERY_LENGTH
              }
            >
              <div class='py-5 text-center opacity-60'>
                {translateToken(
                  'no_results',
                  modalLang(),
                  'No matching verses found.',
                )}
              </div>
            </Show>

            <For each={results()}>
              {item => (
                <div
                  class='mb-2 cursor-pointer rounded-md p-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10'
                  onClick={() => handleSelectVerse(item.book_id, item.chapter)}
                >
                  <div class='flex justify-between text-sm font-bold'>
                    <span>
                      {getLocalizedBookName(item.book_id)} {item.chapter}:
                      {item.verse}
                    </span>
                    <Show when={item.similarity}>
                      <span class='font-semibold text-(--accent-color)'>
                        {(item.similarity * 100).toFixed(0)}%{' '}
                        {translateToken('match', modalLang(), 'match')}
                      </span>
                    </Show>
                  </div>
                  <div class='mt-1 text-sm'>{item.text}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}
