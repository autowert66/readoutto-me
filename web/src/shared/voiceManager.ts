import { getVoices } from '../utils/getVoices.ts';
import { showSnackbar } from '../utils/showSnackbar.ts';
import { VoiceManager } from '../utils/VoiceManager.ts';

export const voiceManagerPromise = getVoices()
  .then((voices) => new VoiceManager(voices))
  .catch((err) => {
    console.error('Loading voices failed:', err);
    showSnackbar('Failed to load voices, please reload the page', 'error');

    // propagate the error, otherwise the voiceManagerPromise.then would be called with undefined
    throw err;
  });
