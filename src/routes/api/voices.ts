import { Hono } from 'hono';
import { getVoices } from '../../utils/getVoices.ts';

const voicesRoute = new Hono().get('/voices', async (c) => {
  const voices = await getVoices();
  return c.json(voices);
});

export { voicesRoute };
