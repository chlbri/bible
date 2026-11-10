import tailwindcss from '@tailwindcss/vite';
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
    tailwindcss(),
    tanstackStart({
      // Render the app entirely on the client. The prerendered file is only an
      // empty shell: no language-dependent markup is generated on the server, so
      // the client can start directly with the user's preferred language.
      spa: {
        enabled: true,
        maskPath: '/',
        prerender: { outputPath: '/index' },
      },
    }),
    nitro(),
    viteSolid({ ssr: true, extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
  ],
});
