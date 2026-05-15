import { Hono } from 'hono';

import { staticRoute } from './routes/static.ts';
import { apiRoute } from './routes/api/index.ts';

const app = new Hono();

app.route('/', staticRoute);
app.route('/api', apiRoute);

export { app };
