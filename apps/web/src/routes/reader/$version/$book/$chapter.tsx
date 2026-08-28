import { tauriBridge } from '@bemedev/bible';
import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { createResource, For, Show } from 'solid-js';

import { fetchChapterServerFn } from '../../../../server/db.js';

export const Route = createFileRoute('/reader/$version/$book/$chapter')({
  component: ReaderPage,
  ssr: false,
});

function ReaderPage() {
  const params = Route.useParams();
  const navigate = useNavigate();

  const [chapterData] = createResource(
    () => ({
      version: params().version,
      book: params().book,
      chapter: parseInt(params().chapter, 10),
    }),
    async ({ version, book, chapter }) => {
      // 1. If running in Tauri Desktop, use Native Rust IPC
      if (tauriBridge.isTauri()) {
        try {
          return await tauriBridge.getChapter(version, book, chapter);
        } catch (e) {
          console.warn('Tauri IPC failed, falling back to server function:', e);
        }
      }

      // 2. If running in Web Browser / SSR, query SQLite via TanStack Server Function
      try {
        const serverData = await fetchChapterServerFn({
          data: { version, book, chapter },
        });
        if (serverData) return serverData;
      } catch (e) {
        console.error('Server function error:', e);
      }

      return null;
    },
  );

  const goToChapter = (delta: number) => {
    const currentChap = parseInt(params().chapter, 10);
    const nextChap = Math.max(1, currentChap + delta);
    navigate({
      to: '/reader/$version/$book/$chapter',
      params: {
        version: params().version,
        book: params().book,
        chapter: String(nextChap),
      },
    });
  };

  return (
    <div class='reader-container'>
      <Show when={chapterData.loading}>
        <div
          style={{ 'text-align': 'center', 'padding-top': '100px', opacity: 0.5 }}
        >
          Opening chapter...
        </div>
      </Show>

      <Show when={chapterData()}>
        {data => (
          <div>
            <h1 class='chapter-title'>
              {data().book_id} {data().chapter}
            </h1>

            <div class='verses-content'>
              <For each={data().verses}>
                {v => (
                  <span class='verse-item'>
                    <span class='verse-number'>{v.verse}</span>
                    <span class='verse-text'>{v.text} </span>
                  </span>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>

      <footer class='reader-footer'>
        <button class='btn' onClick={() => goToChapter(-1)}>
          ← Previous
        </button>
        <span style={{ opacity: 0.7 }}>
          {params().book} {params().chapter} ({params().version.toUpperCase()})
        </span>
        <button class='btn' onClick={() => goToChapter(1)}>
          Next →
        </button>
      </footer>
    </div>
  );
}
