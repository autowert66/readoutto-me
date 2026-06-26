import { getVoices } from '../utils/getVoices.ts';
import { createOption } from '../utils/createOption.ts';
import { VoiceManager } from '../utils/VoiceManager.ts';

const langSelect = document.getElementById('lang-select')! as HTMLSelectElement;
const voiceSelect = document.getElementById('voice-select')! as HTMLSelectElement;

getVoices().then((voices) => {
  const voiceManager = new VoiceManager(voices);

  langSelect.replaceChildren();
  for (const lang of voiceManager.getLanguages()) {
    const option = createOption(
      lang,
      VoiceManager.getLanguageDisplayName(lang),
    );
    langSelect.appendChild(option);
  }

  function handleLangChange() {
    const lang = langSelect.value;
    const voices = voiceManager.getVoicesByLanguage(lang);
    if (!voices || !voices.length) return;

    voiceManager.setLastLanguage(lang);

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

  langSelect.value = voiceManager.getInitialLanguage();
  langSelect.dispatchEvent(new Event('change'));
});
