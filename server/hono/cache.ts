import { createMiddleware } from 'hono/factory';

export default function cache(seconds: number) {
  return createMiddleware(async (c, next) => {
    if (!c.req.path.match(/\.[a-zA-Z0-9]+$/) || c.req.path.endsWith('.data')) {
      return next();
    }

    await next();

    if (!c.res.ok) {
      return;
    }

    c.res.headers.set('cache-control', `public, max-age=${seconds}`);
  });
}
