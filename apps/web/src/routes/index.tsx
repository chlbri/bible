import { createFileRoute, Navigate, useNavigate } from '@tanstack/solid-router';
import { getDefaultVersionForLanguage } from '@bemedev/bible';
import { onMount } from 'solid-js';
import { getInitialLanguage, currentVersion, setCurrentLanguage, setCurrentVersion } from '../store.js';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();

  const getTargetVersion = () => {
    const lang = getInitialLanguage();
    const ver = getDefaultVersionForLanguage(lang);
    return ver || currentVersion();
  };

  onMount(() => {
    const lang = getInitialLanguage();
    const ver = getDefaultVersionForLanguage(lang);
    setCurrentLanguage(lang);
    setCurrentVersion(ver);
    navigate({
      to: '/reader/$version/$book/$chapter',
      params: {
        version: ver,
        book: 'GENESIS',
        chapter: '1',
      },
      replace: true,
    });
  });

  return (
    <Navigate
      to="/reader/$version/$book/$chapter"
      params={{
        version: getTargetVersion(),
        book: 'GENESIS',
        chapter: '1',
      }}
    />
  );
}
