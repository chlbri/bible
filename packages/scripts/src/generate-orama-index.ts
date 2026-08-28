import fs from 'node:fs/promises';
import path from 'node:path';
import { create, insertMultiple } from '@orama/orama';
import { stemmer as frenchStemmer } from '@orama/stemmers/french';
import { stemmer as englishStemmer } from '@orama/stemmers/english';

interface RawBibleJSON {
  version_id: string;
  version_name: string;
  language: string;
  testaments: {
    [testament: string]: {
      [book: string]: {
        [chapter: string]: string[];
      };
    };
  };
}

interface VerseDocument {
  id: string;
  version_id: string;
  testament: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  embedding?: number[];
}

/**
 * Builds an Orama search index snapshot for a Bible translation.
 */
export async function generateBibleIndex(jsonFilePath: string, outputDir: string) {
  console.log(`[1/4] Loading JSON file: ${jsonFilePath}`);
  const rawData: RawBibleJSON = JSON.parse(await fs.readFile(jsonFilePath, 'utf-8'));
  const isFrench = rawData.language.toLowerCase().includes('french');

  console.log(`[2/4] Extracting flat verses list...`);
  const flatVerses: VerseDocument[] = [];

  for (const [testament, books] of Object.entries(rawData.testaments)) {
    for (const [book, chapters] of Object.entries(books)) {
      for (const [chapterStr, verses] of Object.entries(chapters)) {
        const chapter = parseInt(chapterStr, 10);
        verses.forEach((text, index) => {
          const verse = index + 1;
          flatVerses.push({
            id: `${rawData.version_id}_${book}_${chapter}_${verse}`,
            version_id: rawData.version_id,
            testament,
            book,
            chapter,
            verse,
            text,
          });
        });
      }
    }
  }

  console.log(`Extracted ${flatVerses.length} verses.`);

  console.log(`[3/4] Creating Orama database index...`);
  const db = await create({
    schema: {
      id: 'string',
      version_id: 'string',
      testament: 'string',
      book: 'string',
      chapter: 'number',
      verse: 'number',
      text: 'string',
    },
    components: {
      tokenizer: {
        stemmer: isFrench ? frenchStemmer : englishStemmer,
      },
    },
  });

  await insertMultiple(db, flatVerses);

  await fs.mkdir(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, `${rawData.version_id}.orama.json`);

  console.log(`[4/4] Writing Orama snapshot to ${outputFile}...`);
  await fs.writeFile(outputFile, JSON.stringify(db, null, 2), 'utf-8');

  console.log(`🎉 Done! ${rawData.version_id} Orama index generated.`);
}

