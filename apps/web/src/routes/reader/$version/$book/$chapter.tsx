import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { createResource, For, Show } from 'solid-js';
import { tauriBridge } from '@bemedev/bible';

export const Route = createFileRoute('/reader/$version/$book/$chapter')({
  component: ReaderPage,
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
      if (tauriBridge.isTauri()) {
        return await tauriBridge.getChapter(version, book, chapter);
      }
      // Clean fallback for browser preview without Tauri desktop window
      return {
        version_id: version,
        book_id: book,
        chapter,
        verses: [
          { verse: 1, text: "Au commencement, Dieu créa les cieux et la terre." },
          { verse: 2, text: "La terre était informe et vide: il y avait des ténèbres à la surface de l'abîme, et l'esprit de Dieu se mouvait au-dessus des eaux." },
          { verse: 3, text: "Dieu dit: Que la lumière soit! Et la lumière fut." },
          { verse: 4, text: "Dieu vit que la lumière était bonne; et Dieu sépara la lumière d'avec les ténèbres." },
          { verse: 5, text: "Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour." }
        ]
      };
    }
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
    <div class="reader-container">
      <Show when={chapterData.loading}>
        <div style={{ 'text-align': 'center', 'padding-top': '100px', opacity: 0.5 }}>
          Opening chapter...
        </div>
      </Show>

      <Show when={chapterData()}>
        {(data) => (
          <div>
            <h1 class="chapter-title">
              {data().book_id} {data().chapter}
            </h1>

            <div class="verses-content">
              <For each={data().verses}>
                {(v) => (
                  <span class="verse-item">
                    <span class="verse-number">{v.verse}</span>
                    <span class="verse-text">{v.text} </span>
                  </span>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>

      <footer class="reader-footer">
        <button class="btn" onClick={() => goToChapter(-1)}>
          ← Previous
        </button>
        <span style={{ opacity: 0.7 }}>
          {params().book} {params().chapter} ({params().version.toUpperCase()})
        </span>
        <button class="btn" onClick={() => goToChapter(1)}>
          Next →
        </button>
      </footer>
    </div>
  );
}
