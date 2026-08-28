import { createSignal, createEffect, For, Show } from 'solid-js';
import { isSearchOpen, setIsSearchOpen, currentVersion } from '../store.js';
import { useNavigate } from '@tanstack/solid-router';
import { tauriBridge } from '@bemedev/bible';

export function SearchModal() {
  const [query, setQuery] = createSignal('');
  const [mode, setMode] = createSignal<'semantic' | 'keyword'>('semantic');
  const [results, setResults] = createSignal<any[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();

  let debounceTimer: any;

  createEffect(() => {
    const q = query().trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (tauriBridge.isTauri()) {
          if (mode() === 'semantic') {
            const res = await tauriBridge.searchSemantic(currentVersion(), q, 15);
            setResults(res);
          } else {
            const res = await tauriBridge.searchKeywords(currentVersion(), q, 15);
            setResults(res);
          }
        } else {
          // Web preview mock results
          setResults([
            { id: '1', book_id: 'GENESIS', chapter: 1, verse: 1, text: 'Au commencement, Dieu créa les cieux et la terre.', similarity: 0.85 },
            { id: '2', book_id: 'JOHN', chapter: 1, verse: 1, text: 'Au commencement était la Parole, et la Parole était avec Dieu...', similarity: 0.82 },
          ]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  });

  const handleSelectVerse = (bookId: string, chapter: number) => {
    setIsSearchOpen(false);
    navigate({
      to: '/reader/$version/$book/$chapter',
      params: {
        version: currentVersion(),
        book: bookId,
        chapter: String(chapter),
      },
    });
  };

  return (
    <Show when={isSearchOpen()}>
      <div class="modal-overlay" onClick={() => setIsSearchOpen(false)}>
        <div class="modal-card" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', 'border-bottom': '1px solid var(--border-color)' }}>
            <input
              type="text"
              class="search-input"
              placeholder="Search by meaning or keywords..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              autofocus
            />
            <div style={{ display: 'flex', 'align-items': 'center', padding: '0 12px', gap: '6px' }}>
              <button
                class="btn"
                style={{
                  'background-color': mode() === 'semantic' ? 'var(--accent-color)' : 'transparent',
                  color: mode() === 'semantic' ? '#ffffff' : 'var(--text-color)',
                }}
                onClick={() => setMode('semantic')}
              >
                Meaning
              </button>
              <button
                class="btn"
                style={{
                  'background-color': mode() === 'keyword' ? 'var(--accent-color)' : 'transparent',
                  color: mode() === 'keyword' ? '#ffffff' : 'var(--text-color)',
                }}
                onClick={() => setMode('keyword')}
              >
                Keyword
              </button>
            </div>
          </div>

          <div style={{ 'max-height': '400px', 'overflow-y': 'auto', padding: '12px' }}>
            <Show when={isLoading()}>
              <div style={{ 'text-align': 'center', padding: '20px', opacity: 0.6 }}>
                Searching across 31,102 verses...
              </div>
            </Show>

            <Show when={!isLoading() && results().length === 0 && query().length >= 2}>
              <div style={{ 'text-align': 'center', padding: '20px', opacity: 0.6 }}>
                No matching verses found.
              </div>
            </Show>

            <For each={results()}>
              {(item) => (
                <div
                  class="verse-item"
                  style={{ 'margin-bottom': '8px', padding: '8px', 'border-radius': '6px' }}
                  onClick={() => handleSelectVerse(item.book_id, item.chapter)}
                >
                  <div style={{ 'font-weight': 'bold', 'font-size': '0.9em', display: 'flex', 'justify-content': 'space-between' }}>
                    <span>{item.book_id} {item.chapter}:{item.verse}</span>
                    <Show when={item.similarity}>
                      <span style={{ color: 'var(--accent-color)' }}>
                        {(item.similarity * 100).toFixed(0)}% match
                      </span>
                    </Show>
                  </div>
                  <div style={{ 'font-size': '0.95em', 'margin-top': '4px' }}>{item.text}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}
