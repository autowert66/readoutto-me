import { Hono } from 'hono';

import { voicesRoute } from './voices.ts';
import { helloWorldRoute } from './helloWorld.ts';
import { readRoute } from './read.ts';

const apiRoute = new Hono()
  .route('/', voicesRoute)
  .route('/', helloWorldRoute)
  .route('/', readRoute);

export { apiRoute };
