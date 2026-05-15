import { Hono } from 'hono';

import { voicesRoute } from './voices.ts';
import { helloWorldRoute } from './helloWorld.ts';
import { readRoute } from './read.ts';

const apiRoute = new Hono();

apiRoute.route('/', voicesRoute);
apiRoute.route('/', helloWorldRoute);
apiRoute.route('/', readRoute);

export { apiRoute };
