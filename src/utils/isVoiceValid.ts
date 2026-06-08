import { getVoices } from "./getVoices.ts";

let _voiceNameSet: Set<string>;
export async function isVoiceValid(voiceName: string): Promise<boolean> {
  if(!_voiceNameSet) {
    const voices = await getVoices();

    _voiceNameSet = new Set(voices.map(voice => voice.ShortName));
  }

  return _voiceNameSet.has(voiceName);
}
