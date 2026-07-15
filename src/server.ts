import './utils/globalUncaughtErrors.ts';
import { app } from './app.ts';

const PORT = Number(Deno.env.get('PORT') || '8080');

Deno.serve({
  port: PORT,
  onListen: () => console.log(`App listening on http://localhost:${PORT}`),
}, app.fetch);
