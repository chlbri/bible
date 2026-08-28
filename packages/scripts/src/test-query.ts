import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const rootDir = path.resolve(import.meta.dirname, '../../..');
const readerDbPath = path.join(rootDir, 'bible_reader.db');
const semanticDbPath = path.join(rootDir, 'bible_semantic.db');

function testReader() {
  console.log('\n--- 1. Testing Kindle Reader Query (bible_reader.db) ---');
  const t0 = performance.now();
  const db = new DatabaseSync(readerDbPath);
  const stmt = db.prepare(`
    SELECT verse, text FROM verses 
    WHERE version_id = 'fr_lsg' AND book_id = 'GENESIS' AND chapter = 1 
    ORDER BY verse ASC
  `);
  const rows = stmt.all() as { verse: number; text: string }[];
  const duration = (performance.now() - t0).toFixed(2);
  console.log(`⏱️ Fetched Genesis 1 (${rows.length} verses) in ${duration}ms!`);
  console.log(`Sample Verse 1: [1] ${rows[0].text}`);
}

function testFts() {
  console.log('\n--- 2. Testing FTS5 Keyword Search (bible_semantic.db) ---');
  const t0 = performance.now();
  const db = new DatabaseSync(semanticDbPath);
  const stmt = db.prepare(`
    SELECT book_id, chapter, verse, text, rank 
    FROM verses_fts 
    WHERE verses_fts MATCH 'lumière ténèbres'
    ORDER BY rank
    LIMIT 5
  `);
  const rows = stmt.all() as { book_id: string; chapter: number; verse: number; text: string; rank: number }[];
  const duration = (performance.now() - t0).toFixed(2);
  console.log(`⏱️ Keyword search executed in ${duration}ms (${rows.length} matches):`);
  rows.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.book_id} ${r.chapter}:${r.verse}] ${r.text.substring(0, 80)}...`);
  });
}

async function testSemanticSearch(query = 'trouver la paix dans les moments difficiles') {
  console.log(`\n--- 3. Testing Semantic Meaning Search (Query: "${query}") ---`);
  const t0 = performance.now();
  
  // 1. Get query embedding from Ollama
  const res = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', input: [query] }),
  });
  const data = (await res.json()) as { embeddings: number[][] };
  const queryVec = new Float32Array(data.embeddings[0]);
  const tEmbed = (performance.now() - t0).toFixed(2);
  console.log(`⏱️ Generated query embedding via Ollama in ${tEmbed}ms`);

  // 2. Compute Cosine Similarity against all verses in bible_semantic.db
  const tDb0 = performance.now();
  const db = new DatabaseSync(semanticDbPath);
  const stmt = db.prepare(`SELECT id, book_id, chapter, verse, text, vector FROM verses_vectors`);
  const allVerses = stmt.all() as { id: string; book_id: string; chapter: number; verse: number; text: string; vector: Uint8Array }[];

  function cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  const scored = allVerses.map((v) => {
    const verseVec = new Float32Array(v.vector.buffer, v.vector.byteOffset, v.vector.byteLength / 4);
    const score = cosineSimilarity(queryVec, verseVec);
    return { ...v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);
  const tDb = (performance.now() - tDb0).toFixed(2);

  console.log(`⏱️ Scanned all 31,102 vectors in ${tDb}ms! Top 5 semantic matches:`);
  top.forEach((r, i) => {
    console.log(`  ${i + 1}. [Score: ${(r.score * 100).toFixed(1)}%] ${r.book_id} ${r.chapter}:${r.verse} - "${r.text}"`);
  });
}

testReader();
testFts();
testSemanticSearch();
