import { client } from './client.ts';
import type { Voice } from 'msedge-tts';

let _voices: Voice[] | null = null;
let _voicesPromise: Promise<Voice[]> | null = null;

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
