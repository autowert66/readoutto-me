import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const staticRoute = new Hono();

// redirect /index.html to /
staticRoute.get('/index.html', (c) => c.redirect('/', 301));

// aggresive caching for /vendor/ requests
staticRoute.use('/vendor/*', async (c, next) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  await next();
});

staticRoute.get('/', serveStatic({ root: './dist', path: '/index.html' }));
staticRoute.use('/*', serveStatic({ root: './dist' }));

export { staticRoute };
