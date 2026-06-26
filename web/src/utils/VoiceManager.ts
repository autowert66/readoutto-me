import type { ApiVoice } from '../../../src/routes/api/voices.ts';

const languageDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' });

export class VoiceManager {
  private languageMap: Map<string, ApiVoice[]>;

  static getLanguageDisplayName(lang: string) {
    return languageDisplayNames.of(lang) || lang;
  }

  constructor(voices: ApiVoice[]) {
    this.languageMap = new Map();
    this.processVoices(voices);
  }

  private processVoices(voices: ApiVoice[]) {
    for (const voice of voices) {
      const { Locale } = voice;

      let voices = this.languageMap.get(Locale);
      if (!voices) {
        voices = [];
        this.languageMap.set(Locale, voices);
      }

      voices.push(voice);
    }
  }

  getLanguages() {
    return this.languageMap.keys();
  }

  getVoicesByLanguage(lang: string) {
    return this.languageMap.get(lang);
  }
}
