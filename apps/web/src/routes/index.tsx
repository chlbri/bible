import { createFileRoute, Navigate } from '@tanstack/solid-router';
import { currentVersion } from '../store.js';

export const Route = createFileRoute('/')({
  component: () => (
    <Navigate
      to="/reader/$version/$book/$chapter"
      params={{
        version: currentVersion(),
        book: 'GENESIS',
        chapter: '1',
      }}
    />
  ),
});
