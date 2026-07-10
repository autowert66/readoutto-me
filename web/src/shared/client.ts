import { hc } from 'hono/client';
import type { AppType } from '../../../src/app.ts';

export const client = hc<AppType>(location.origin);
