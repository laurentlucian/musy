import { RemixBrowser } from '@remix-run/react';
import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';

import { CacheProvider } from '@emotion/react';

import { ClientStyleContext } from './lib/emotion/context';
import { createEmotionCache } from './lib/emotion/createEmotionCache';

interface ClientCacheProviderProps {
  children: React.ReactNode;
}

const ClientCacheProvider = ({ children }: ClientCacheProviderProps) => {
  const [cache, setCache] = React.useState(createEmotionCache());

  const reset = () => {
    setCache(createEmotionCache());
  };

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
};

hydrateRoot(
  document,
  <ClientCacheProvider>
    <RemixBrowser />
  </ClientCacheProvider>,
);
