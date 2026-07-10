import { getVoices } from '../utils/getVoices.ts';
import { VoiceManager } from '../utils/VoiceManager.ts';

export const voiceManagerPromise = getVoices()
  .then((voices) => new VoiceManager(voices));
