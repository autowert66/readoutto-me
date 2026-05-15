import { getVoices } from './utils/getVoices.js';
import { createOption } from './utils/createOption.js';

/** @type {HTMLTextAreaElement} */
const toreadTextarea = document.getElementById('toread-textarea');
const langSelect = document.getElementById('lang-select');
const voiceSelect = document.getElementById('voice-select');
const playAudioBtn = document.getElementById('play-audio-btn');

let audioEl;

// dynamically import dynamic-theme in a non-blocking way since it is not critical (promise is not awaited)
import('./utils/dynamic-theme.js');

getVoices().then((voices) => {
  const languagesSet = new Set(
    voices.map((voice) => voice.Locale)
  );

  const languageDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' });
  langSelect.replaceChildren();
  for (const lang of languagesSet) {
    const option = createOption(lang, languageDisplayNames.of(lang));
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
        .replace(/\s?Neural$/, '')

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
    const parent = toreadTextarea.parentElement;
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
    document.body.appendChild(audioEl);
  }

  const searchParams = new URLSearchParams();
  searchParams.set('text', value);
  searchParams.set('voice', voice);
  audioEl.src = '/api/read?' + searchParams.toString();
  audioEl.play();
});
