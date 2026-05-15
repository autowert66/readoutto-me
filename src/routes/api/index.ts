import { Hono } from 'hono';

import { voicesRoute } from './voices.ts';
import { helloWorldRoute } from './helloWorld.ts';

const apiRoute = new Hono();

apiRoute.route('/', voicesRoute);
apiRoute.route('/', helloWorldRoute);

export { apiRoute };
