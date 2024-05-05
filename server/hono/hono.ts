import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { type AppLoadContext, type ServerBuild, installGlobals } from '@remix-run/node';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { logger } from 'hono/logger';
import { remix } from 'remix-hono/handler';
import { session } from 'remix-hono/session';
import { sessionStorage } from '~/services/session.server';
import cache from './cache.js';

declare module '@remix-run/node' {
  interface AppLoadContext {
    /**
     * The app version from the build assets
     */
    readonly appVersion: string;
  }
}

const mode = process.env.NODE_ENV === 'test' ? 'development' : process.env.NODE_ENV;
const isDev = mode === 'development';

export default async function () {
  installGlobals();

  const app = new Hono();

  app.use(
    '/assets/*',
    cache(60 * 60 * 24 * 365), // 1 year
    serveStatic({ root: './build/client' }),
  );

  app.use('*', cache(60 * 60), serveStatic({ root: isDev ? './public' : './build/client' })); // 1 hour

  app.use('*', logger());

  /**
   * Add session middleware (https://github.com/sergiodxa/remix-hono?tab=readme-ov-file#session-management)
   */
  app.use(
    session({
      autoCommit: true,
      createSessionStorage() {
        return sessionStorage;
      },
    }),
  );

  const viteDevServer = isDev
    ? await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      )
    : null;

  /**
   * Add remix middleware to Hono server
   */
  app.use(async (c, next) => {
    const build = viteDevServer
      ? await viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : await import('../../build/server/index.js');

    return remix({
      build: build as unknown as ServerBuild,
      mode,
      getLoadContext() {
        return {
          appVersion: isDev ? build.assets.version : 'dev',
        } satisfies AppLoadContext;
      },
    })(c, next);
  });

  if (viteDevServer) {
    const viteMiddleware = createMiddleware((req, res) => {
      return new Promise((resolve, reject) => {
        viteDevServer.middlewares(req, res, (result) => {
          if (result instanceof Error) reject(result);
          else resolve(result);
        });
      });
    });

    app.use(viteMiddleware);
  } else {
    serve(
      {
        ...app,
        port: Number(process.env.PORT) || 3000,
      },
      async (info) => {
        console.log(`🚀 Server started on port ${info.port}`);
      },
    );
  }
}
