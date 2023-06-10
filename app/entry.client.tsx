import { RemixBrowser } from '@remix-run/react';
import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import { startTransition, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { CacheProvider } from '@emotion/react';

import { ClientStyleContext } from '~/lib/emotion/context';
import createEmotionCache from '~/lib/emotion/createEmotionCache';

interface ClientCacheProviderProps {
  children: ReactNode;
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache());

  function reset() {
    setCache(createEmotionCache());
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

startTransition(() => {
  hydrateRoot(
    document,
    <ClientCacheProvider>
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    </ClientCacheProvider>,
  );
});
