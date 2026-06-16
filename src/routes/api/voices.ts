import { Hono } from 'hono';
import { getVoices } from '../../utils/getVoices.ts';
import { Voice } from 'msedge-tts';

export type ApiVoice = Pick<Voice, 'ShortName' | 'Locale' | 'Gender'>;

let _apiVoices: ApiVoice[] | null = null;

const voicesRoute = new Hono().get('/voices', async (c) => {
  let voices = _apiVoices;

  if (!voices) {
    const _voices = await getVoices();
    voices = _voices.map((voice) => ({
      ShortName: voice.ShortName,
      Locale: voice.Locale,
      Gender: voice.Gender,
    }));

    _apiVoices = voices;
  }

  return c.json(voices);
});

export { voicesRoute };
