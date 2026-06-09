import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const staticRoute = new Hono()
  .get('/index.html', (c) => c.redirect('/', 301))
    // aggressive caching for /vendor/ requests
  .use('/vendor/*', async (c, next) => {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    await next();
  })
  .get('/', serveStatic({ root: './dist', path: '/index.html' }))
  .use('/*', serveStatic({ root: './dist' }));

export { staticRoute };
