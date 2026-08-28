import {
  getAdjacentChapter,
  getAdjacentBook,
  getBookById,
  getChapterFromData,
  getLanguageForVersion,
  translateToken,
} from '@bemedev/bible';
import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { createResource, For, Show, onMount, onCleanup } from 'solid-js';

import { isSearchOpen } from '../../../../store.js';

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

  const nextTarget = () => getAdjacentChapter(params().book, currentChapterNum(), 1);

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

  const goToAdjacentBook = (delta: number) => {
    const target = getAdjacentBook(params().book, delta);
    if (target) {
      navigate({
        to: '/reader/$version/$book/$chapter',
        params: { version: params().version, book: target.bookId, chapter: '1' },
      });
    }
  };

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchOpen()) return;

      const activeEl = (document.activeElement || e.target) as HTMLElement | null;
      const isInputOrDropdown =
        activeEl &&
        (activeEl.tagName === 'SELECT' ||
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      if (isInputOrDropdown) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToAdjacentChapter(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToAdjacentChapter(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToAdjacentBook(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToAdjacentBook(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  const currentLang = () => getLanguageForVersion(params().version);

  const localizedBookName = () => {
    const book = getBookById(params().book, currentLang());
    return book?.translatedName || params().book;
  };

  const navBtnClass =
    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[var(--border-color)] bg-transparent text-[var(--text-color)] text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div class='mx-auto max-w-5xl px-6 pt-20 pb-28'>
      <Show when={chapterData.loading}>
        <div class='pt-24 text-center opacity-50'>
          {translateToken('opening_chapter', currentLang(), 'Opening chapter...')}
        </div>
      </Show>

      <Show when={chapterData()}>
        {data => (
          <div>
            <h1 class='mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl'>
              {localizedBookName()} {data().chapter}
            </h1>

            <div class='space-y-3'>
              <For each={data().verses}>
                {v => (
                  <span class='relative mr-1.5 mb-2 inline-block cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10'>
                    <span class='mr-1.5 align-super text-xs font-bold text-(--verse-num-color) select-none'>
                      {v.verse}
                    </span>
                    <span>{v.text} </span>
                  </span>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>

      <footer class='fixed right-0 bottom-0 left-0 z-50 flex h-[54px] items-center justify-between border-t border-(--border-color) bg-(--header-bg) px-6 text-sm backdrop-blur-md'>
        <button
          class={navBtnClass}
          disabled={!prevTarget()}
          onClick={() => goToAdjacentChapter(-1)}
        >
          ← {translateToken('previous', currentLang(), 'Previous')}
        </button>

        <span class='opacity-70'>
          {localizedBookName()} {params().chapter} ({params().version.toUpperCase()})
        </span>

        <button
          class={navBtnClass}
          disabled={!nextTarget()}
          onClick={() => goToAdjacentChapter(1)}
        >
          {translateToken('next', currentLang(), 'Next')} →
        </button>
      </footer>
    </div>
  );
}
