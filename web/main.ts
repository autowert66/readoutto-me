import 'beercss/dist/cdn/beer.min.js';

import { getVoices } from './utils/getVoices.ts';
import { createOption } from './utils/createOption.ts';
import { client } from './utils/client.ts';
import type { Voice } from 'msedge-tts';

import './utils/dynamicTheme.ts';

/** @type {HTMLTextAreaElement} */
const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const langSelect = document.getElementById('lang-select')! as HTMLSelectElement;
const voiceSelect = document.getElementById('voice-select')! as HTMLSelectElement;
const playAudioBtn = document.getElementById('play-audio-btn')!;
const audioContainer = document.getElementById('audioContainer')!;

let audioEl: HTMLAudioElement;

getVoices().then((voices) => {
  const languagesSet = new Set<string>(
    voices.map((voice: Voice) => voice.Locale),
  );

  const languageDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' });
  langSelect.replaceChildren();
  for (const lang of languagesSet) {
    const option = createOption(lang, languageDisplayNames.of(lang) || lang);
    langSelect.appendChild(option);
  }

  const voiceMap = new Map();
  for (const voice of voices) {
    const { Locale } = voice;
    if (!voiceMap.has(Locale)) voiceMap.set(Locale, []);
    voiceMap.get(Locale).push(voice);
  }

  function handleLangChange() {
    const lang = langSelect.value;
    const voices = voiceMap.get(lang);

    voiceSelect.replaceChildren();

    const femaleVoices = document.createElement('optgroup');
    const maleVoices = document.createElement('optgroup');
    femaleVoices.label = 'Female';
    maleVoices.label = 'Male';
    voiceSelect.appendChild(femaleVoices);
    voiceSelect.appendChild(maleVoices);

    for (const voice of voices) {
      const { Gender, ShortName } = voice;
      const readableName = ShortName
        .replace(/^.+-/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s?Neural$/, '');

      const option = createOption(ShortName, readableName);

      if (Gender === 'Female') femaleVoices.appendChild(option);
      else maleVoices.appendChild(option);
    }
  }

  langSelect.addEventListener('change', () => {
    handleLangChange();
  });

  langSelect.value = navigator.language;
  langSelect.dispatchEvent(new Event('change'));
});

playAudioBtn.addEventListener('click', (ev) => {
  ev.preventDefault();

  const { value } = toreadTextarea;
  const voice = voiceSelect.value;

  if (!value) {
    const parent = toreadTextarea.parentElement!;
    if (parent.querySelector('output')) return;

    const output = document.createElement('output');
    output.textContent = 'Text to read is required';
    parent.appendChild(output);

    parent.classList.add('invalid');
    output.classList.add('invalid');

    toreadTextarea.addEventListener('change', () => {
      parent.classList.remove('invalid');
      output.remove();
    });

    return;
  }

  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.setAttribute('controls', '');
    audioContainer.appendChild(audioEl);
  }

  const url = client.api.read.$url({
    query: {
      text: value,
      voice: voice,
    },
  });

  audioEl.src = url.toString();
  audioEl.play();
});
