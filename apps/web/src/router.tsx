import { createRouter as createTanStackRouter } from '@tanstack/solid-router';
import { routeTree } from './routeTree.gen.js';

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestorationBehavior: 'smooth',
  });

  return router;
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
