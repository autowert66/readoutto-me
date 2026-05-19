import { MsEdgeTTS, type Voice } from 'msedge-tts';

let _voices: Voice[] | null = null;
let _voicesPromise: Promise<Voice[]> | null = null;

const timeout = (ms: number): Promise<never> => new Promise((_, reject) => {
  setTimeout(
    () => reject(new Error(`Timeout after ${ms}ms`)),
    ms
  );
});

// load voices, prefer local file and if it does not exist/fails read from the api
async function _getVoices() {
  try {
    const json = await Deno.readTextFile('./data/voices.json');
    _voices = JSON.parse(json) as Voice[];
    return _voices;
  } catch (_err) {
    const tts = new MsEdgeTTS();
    _voices = await Promise.race([
      tts.getVoices(),
      timeout(5_000),
    ]);

    try {
      const json = JSON.stringify(_voices);
      await Deno.mkdir('./data', { recursive: true });
      await Deno.writeTextFile('./data/voices.json', json);
    } catch (err) {
      console.error('Failed to write voices.json file:', err);
    }

    return _voices;
  }
}

// wrapper function that prevents multiple read/api requests on concurrent getVoices calls
export async function getVoices(): Promise<Voice[]> {
  if (_voices) return _voices;
  if (_voicesPromise) return _voicesPromise;

  _voicesPromise = _getVoices();
  _voicesPromise.catch((err) => {
    _voicesPromise = null;
    throw err;
  }); // clear on error to not cause persistent errors

  return await _voicesPromise;
}
