/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/solid-router';
import { HydrationScript } from 'solid-js/web';
import { SearchModal } from '../components/SearchModal.js';
import {
  currentVersion,
  setCurrentVersion,
  fontSize,
  theme,
  isSearchOpen,
  setIsSearchOpen,
  cycleTheme,
  increaseFontSize,
  decreaseFontSize,
} from '../store.js';
import appCss from '../styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Bible - Reader & Semantic Search' },
    ],
  }),

  shellComponent: ({ children }) => {
    return (
      <html lang="en" data-theme={theme()}>
        <head>
          <HydrationScript />
          <HeadContent />
        </head>
        <body>
          {children}
          <Scripts />
        </body>
      </html>
    );
  },

  component: () => {
    return (
      <div class="app-root">
        <header class="reader-header">
          <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
            <span style={{ 'font-weight': 'bold', 'letter-spacing': '0.05em' }}>📖 BIBLE</span>
            <select
              class="btn"
              value={currentVersion()}
              onChange={(e) => setCurrentVersion(e.currentTarget.value)}
            >
              <option value="fr_lsg">Louis Segond (FR)</option>
              <option value="en_kjv">King James Version (EN)</option>
              <option value="en_bsb">Berean Study Bible (EN)</option>
              <option value="fr_ost">Ostervald (FR)</option>
            </select>
          </div>

          <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
            <button
              class="btn"
              onClick={() => setIsSearchOpen(!isSearchOpen())}
              title="Search (Cmd+K)"
            >
              🔍 Search
            </button>
            <button class="btn" onClick={decreaseFontSize} title="Decrease font size">
              A-
            </button>
            <button class="btn" onClick={increaseFontSize} title="Increase font size">
              A+
            </button>
            <button class="btn" onClick={cycleTheme} title="Change Theme">
              🎨 {theme().toUpperCase()}
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>

        <SearchModal />
      </div>
    );
  },
});
