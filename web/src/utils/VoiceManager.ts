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
    // lang is in the format language-COUNTRY, e.g. de-DE or en-US
    return this.languageMap.get(lang);
  }

  getVoicesByLanguagePrefix(prefix: string) {
    // get all language keys matching the prefix (language), so for `de` it would be de-DE, de-AT and de-CH
    // sorted by number of available voices, that typically results in the more popular voices being first

    const languages = Array.from(this.languageMap.keys());
    const filtered = languages.filter((lang) => lang.startsWith(prefix));
    filtered.sort((a, b) => {
      return this.getVoicesByLanguage(b)!.length - this.getVoicesByLanguage(a)!.length;
    });

    return filtered;
  }

  setLastLanguage(lang: string) {
    localStorage.setItem('lastLang', lang);
  }

  getInitialLanguage() {
    return localStorage.getItem('lastLang') || this.getUserLang();
  }

  private getUserLang() {
    // navigator.language might just be the language (without the country),
    // so we try to find the first one that is a complete language or otherwise use the first one that finds some language by prefix
    const { languages } = navigator;

    let lang = languages.find((lang) => this.languageMap.has(lang));
    lang ||= languages.map((lang) => this.getVoicesByLanguagePrefix(lang)[0]).find(Boolean);
    lang ||= 'en-US';

    return lang;
  }
}
