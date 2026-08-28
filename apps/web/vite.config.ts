import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: { port: 3000 },
  resolve: {
    alias: {
      '@bemedev/bible': path.resolve(__dirname, '../../packages/bible/src/index.ts'),
    },
  },
  plugins: [
    tanstackStart({}),
    nitro({}),
    viteSolid({ ssr: true, extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
  ],
});
