import { Hono } from 'hono';

import { staticRoute } from './routes/static.ts';
import { apiRoute } from './routes/api/index.ts';

const app = new Hono();

const routes = app
  .route('/', staticRoute)
  .route('/api', apiRoute);

// export the app type for the typed hono/client
export type AppType = typeof routes;

export { app };
