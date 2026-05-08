import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

const app = new Hono();
app.use('/*', serveStatic({ root: './public' }));

Deno.serve({
  port: 8080,
  onListen: () => console.log('App listening on http://localhost:8080/'),
}, app.fetch);
