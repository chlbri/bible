export type Testament = 'Old Testament' | 'New Testament';

export interface BookInfo {
  id: string;
  name: string;
  testament: Testament;
  orderIndex: number;
  totalChapters: number;
}

export interface Verse {
  versionId: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Chapter {
  versionId: string;
  versionName: string;
  bookId: string;
  bookName: string;
  testament: Testament;
  chapter: number;
  verses: Verse[];
}

export interface SearchQuery {
  versionId: string;
  query: string;
  limit?: number;
  offset?: number;
}

export interface KeywordSearchResult {
  verse: Verse;
  score: number;
  highlights: string[];
}

export interface SemanticSearchResult {
  verse: Verse;
  similarity: number; // 0.0 to 1.0
}
