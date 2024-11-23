import { createRequestHandler } from '@remix-run/express';
import { type ServerBuild, installGlobals } from '@remix-run/node';
import express from 'express';

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

  const url = isProduction ? 'https://0.0.0.0:3000' : `http://localhost:3000`;
  app.listen(3000, '0.0.0.0', () => console.log(`musy hosted @ ${url}`));
}
