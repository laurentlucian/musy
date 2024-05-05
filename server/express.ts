import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { createRequestHandler } from '@remix-run/express';
import { type ServerBuild, installGlobals } from '@remix-run/node';
import express from 'express';
import { feedQ } from '~/services/scheduler/jobs/feed.server.js';
import { userQ } from '~/services/scheduler/jobs/user.server.js';
import { followQ } from '~/services/scheduler/jobs/user/follow.server.js';
import { likedQ } from '~/services/scheduler/jobs/user/liked.server.js';
import { playlistQ } from '~/services/scheduler/jobs/user/playlist.server.js';
import { profileQ } from '~/services/scheduler/jobs/user/profile.server.js';
import { recentQ } from '~/services/scheduler/jobs/user/recent.server.js';
import { topQ } from '~/services/scheduler/jobs/user/top.server.js';

const isProduction = process.env.NODE_ENV === 'production';

export default async function () {
  installGlobals();

  const viteDevServer = !isProduction
    ? await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      )
    : null;

  const app = express();

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull-ui');

  createBullBoard({
    queues: [
      new BullMQAdapter(feedQ),
      new BullMQAdapter(userQ),
      new BullMQAdapter(profileQ),
      new BullMQAdapter(playlistQ),
      new BullMQAdapter(recentQ),
      new BullMQAdapter(topQ),
      new BullMQAdapter(followQ),
      new BullMQAdapter(likedQ),
    ],
    serverAdapter,
  });

  app.use('/bull-ui', serverAdapter.getRouter());

  app.disable('x-powered-by');

  if (viteDevServer) {
    // handle asset requests
    app.use(viteDevServer.middlewares);
  } else {
    app.use(
      '/assets',
      express.static('build/client/assets', {
        immutable: true,
        maxAge: '1y',
      }),
    );
  }

  app.use(express.static('build/client', { maxAge: '1h' }));

  const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import('../build/server/index.js');

  // handle SSR requests
  app.all(
    '*',
    createRequestHandler({
      build: build as unknown as ServerBuild,
    }),
  );

  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`musy hosted @ http://localhost:${port}`));
}
