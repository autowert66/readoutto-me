import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const staticRoute = new Hono();

// aggresive caching for /vendor/ requests
staticRoute.use('/vendor/*', async (c, next) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  await next();
});

staticRoute.use('/*', serveStatic({ root: './public' }));
staticRoute.use('/*', serveStatic({ root: './web' }));

export { staticRoute };
