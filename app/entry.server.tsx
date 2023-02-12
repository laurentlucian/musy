import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';

import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';

import { ServerStyleContext } from '~/lib/emotion/context';
import { createEmotionCache } from '~/lib/emotion/createEmotionCache';
import { runSessionsQ } from '~/services/scheduler/jobs/sessions';
import { addUsersToQueue } from '~/services/scheduler/jobs/user';

void runSessionsQ();
void addUsersToQueue();
// clearActivityQOnDev();

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const html = renderToString(
    <ServerStyleContext.Provider value={null}>
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    </ServerStyleContext.Provider>,
  );

  const chunks = extractCriticalToChunks(html);

  const markup = renderToString(
    <ServerStyleContext.Provider value={chunks.styles}>
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    </ServerStyleContext.Provider>,
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${markup}`, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

// https://github.com/emotion-js/emotion/issues/2800
// https://github.com/styled-components/styled-components/issues/3658
// emotion.js doesn't support renderToPipeableStream yet
// preventing musy from taking advantage of the new streaming/defer features in remix 1.11
