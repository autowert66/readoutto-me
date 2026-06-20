import './utils/globalUncaughtErrors.ts';
import { app } from './app.ts';

Deno.serve({
  port: 8080,
  onListen: () => console.log('App listening on http://localhost:8080/'),
}, app.fetch);
