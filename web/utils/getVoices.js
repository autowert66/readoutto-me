let _voices;
let _voicesPromise;

/** @returns {Promise<{ Name: string, ShortName: string, Gender: string, Locale: string, SuggestedCodec: string, FriendlyName: string, Status: string }[]>} */
async function _getVoices() {
  const res = await fetch('/api/voices', {
    cache: 'force-cache',
  });
  const json = await res.json();
  _voices = json;
  return _voices;
}

export async function getVoices() {
  if (_voices) return _voices;
  if (_voicesPromise) return _voicesPromise;

  _voicesPromise = _getVoices();
  _voicesPromise.catch(() => _voicesPromise = null); // clear on error to not cause persistent errors

  return await _voicesPromise;
}
