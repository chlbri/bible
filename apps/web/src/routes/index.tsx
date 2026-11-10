import { createFileRoute, useNavigate } from '@tanstack/solid-router';
import { onMount } from 'solid-js';
import { currentVersion } from '../store.js';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();

  onMount(() => {
    navigate({
      to: '/reader/$version/$book/$chapter',
      params: {
        version: currentVersion(),
        book: 'GENESIS',
        chapter: '1',
      },
      replace: true,
    });
  });

  return null;
}
