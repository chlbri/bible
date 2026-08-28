import type {
  BookInfo,
  Chapter,
  KeywordSearchResult,
  SemanticSearchResult,
} from './types.js';

export function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(
      (window as any).__TAURI_INTERNALS__ ||
      (window as any).__TAURI__ ||
      (window as any).isTauri ||
      (globalThis as any).isTauri,
    )
  );
}

export async function getVersions(): Promise<
  { id: string; name: string; language: string }[]
> {
  if (typeof window === 'undefined') {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('get_versions');
}

export async function getBooks(): Promise<BookInfo[]> {
  if (typeof window === 'undefined') {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('get_books');
}

export async function getChapter(
  versionId: string,
  bookId: string,
  chapter: number,
): Promise<Chapter> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot invoke Tauri IPC on server');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('get_chapter', { version_id: versionId, book_id: bookId, chapter });
}

export async function searchKeywords(
  versionId: string,
  query: string,
  limit = 20,
): Promise<KeywordSearchResult[]> {
  if (typeof window === 'undefined') {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('search_keywords', { version_id: versionId, query, limit });
}

export async function searchSemantic(
  versionId: string,
  query: string,
  limit = 10,
): Promise<SemanticSearchResult[]> {
  if (typeof window === 'undefined') {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('search_semantic', { version_id: versionId, query, limit });
}
