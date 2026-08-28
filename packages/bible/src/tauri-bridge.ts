import type {
  BookInfo,
  Chapter,
  KeywordSearchResult,
  SemanticSearchResult,
} from './types.js';

export function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
  );
}

export async function getVersions(): Promise<
  { id: string; name: string; language: string }[]
> {
  if (!isTauri()) {
    throw new Error('Not running in Tauri environment');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('get_versions');
}

export async function getBooks(): Promise<BookInfo[]> {
  if (!isTauri()) {
    throw new Error('Not running in Tauri environment');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('get_books');
}

export async function getChapter(
  versionId: string,
  bookId: string,
  chapter: number,
): Promise<Chapter> {
  if (!isTauri()) {
    throw new Error('Not running in Tauri environment');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('get_chapter', {
    version_id: versionId,
    book_id: bookId,
    chapter,
  });
}

export async function searchKeywords(
  versionId: string,
  query: string,
  limit = 20,
): Promise<KeywordSearchResult[]> {
  if (!isTauri()) {
    throw new Error('Not running in Tauri environment');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('search_keywords', {
    version_id: versionId,
    query,
    limit,
  });
}

export async function searchSemantic(
  versionId: string,
  query: string,
  limit = 10,
): Promise<SemanticSearchResult[]> {
  if (!isTauri()) {
    throw new Error('Not running in Tauri environment');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke('search_semantic', {
    version_id: versionId,
    query,
    limit,
  });
}
