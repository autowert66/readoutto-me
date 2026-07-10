import { client } from '../shared/client.ts';
import type { ApiVoice } from '../../../src/routes/api/voices.ts';

let _voices: ApiVoice[] | null = null;
let _voicesPromise: Promise<ApiVoice[]> | null = null;

async function _getVoices() {
  const res = await client.api.voices.$get({}, {
    init: { cache: 'force-cache' },
  });
  const json = await res.json();
  _voices = json;
  return _voices;
}

export async function getVoices() {
  if (_voices) return _voices;
  if (_voicesPromise) return _voicesPromise;

  _voicesPromise = _getVoices();
  _voicesPromise.catch(() => {
    _voicesPromise = null;
  });

  return await _voicesPromise;
}
