import { getAdjacentChapter, getBookById, getChapterFromData } from '@bemedev/bible';
import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { createResource, For, Show } from 'solid-js';

import { currentLanguage, t } from '../../../../store.js';

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
      // Pure client-side retrieval from Bible JSON data
      return await getChapterFromData(version, book, chapter);
    },
  );

  const currentChapterNum = () => parseInt(params().chapter, 10) || 1;

  const prevTarget = () =>
    getAdjacentChapter(params().book, currentChapterNum(), -1);

  const nextTarget = () =>
    getAdjacentChapter(params().book, currentChapterNum(), 1);

  const goToAdjacentChapter = (delta: number) => {
    const target = getAdjacentChapter(params().book, currentChapterNum(), delta);
    if (target) {
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: {
          version: params().version,
          book: target.bookId,
          chapter: String(target.chapter),
        },
      });
    }
  };

  const localizedBookName = () => {
    const book = getBookById(params().book, currentLanguage());
    return book?.translatedName || params().book;
  };

  return (
    <div class="reader-container">
      <Show when={chapterData.loading}>
        <div
          style={{ 'text-align': 'center', 'padding-top': '100px', opacity: 0.5 }}
        >
          {t('opening_chapter', 'Opening chapter...')}
        </div>
      </Show>

      <Show when={chapterData()}>
        {(data) => (
          <div>
            <h1 class="chapter-title">
              {localizedBookName()} {data().chapter}
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
        <button
          class="btn"
          disabled={!prevTarget()}
          style={{ opacity: prevTarget() ? 1 : 0.4, cursor: prevTarget() ? 'pointer' : 'not-allowed' }}
          onClick={() => goToAdjacentChapter(-1)}
        >
          ← {t('previous', 'Previous')}
        </button>

        <span style={{ opacity: 0.7 }}>
          {localizedBookName()} {params().chapter} ({params().version.toUpperCase()})
        </span>

        <button
          class="btn"
          disabled={!nextTarget()}
          style={{ opacity: nextTarget() ? 1 : 0.4, cursor: nextTarget() ? 'pointer' : 'not-allowed' }}
          onClick={() => goToAdjacentChapter(1)}
        >
          {t('next', 'Next')} →
        </button>
      </footer>
    </div>
  );
}
