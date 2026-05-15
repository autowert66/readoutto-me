import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const staticRoute = new Hono();

staticRoute.use('/*', serveStatic({ root: './public' }));
staticRoute.use('/*', serveStatic({ root: './web' }));

export { staticRoute };
