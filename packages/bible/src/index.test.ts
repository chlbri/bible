import { describe, expect, it } from 'vitest';
import * as bible from './index.js';

describe('bible package exports', () => {
  it('exports tauriBridge namespace', () => {
    expect(bible.tauriBridge).toBeDefined();
    expect(typeof bible.tauriBridge.getChapter).toBe('function');
    expect(typeof bible.tauriBridge.searchSemantic).toBe('function');
    expect(typeof bible.tauriBridge.searchKeywords).toBe('function');
  });
});
