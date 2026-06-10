import { client } from '../utils/client.ts';

const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const voiceSelect = document.getElementById('voice-select')! as HTMLSelectElement;
const playAudioBtn = document.getElementById('play-audio-btn')! as HTMLButtonElement;
const downloadAudioBtn = document.getElementById('download-audio-btn')! as HTMLButtonElement;
const audioContainer = document.getElementById('audioContainer')!;

let audioEl: HTMLAudioElement | undefined;

playAudioBtn.addEventListener('click', async (ev) => {
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
    }, { once: true });

    return;
  }

  playAudioBtn.disabled = true;
  audioContainer.classList.add('loading');

  try {
    const res = await client.api.read.$post({
      json: {
        text: value,
        voice: voice,
      },
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.setAttribute('controls', '');
      audioContainer.appendChild(audioEl);
    }

    if (audioEl.src) URL.revokeObjectURL(audioEl.src);
    audioEl.src = url;
    downloadAudioBtn.disabled = false;

    audioEl.play();
  } finally {
    playAudioBtn.disabled = false;
    audioContainer.classList.remove('loading');
  }
});

downloadAudioBtn.addEventListener('click', (ev) => {
  ev.preventDefault();

  const url = audioEl?.src;
  if (!url) return;

  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-speech.webm';
  a.click();
});

// workaround for cases where reloading the page does not actually apply the disabled tag again
if (!audioEl) {
  downloadAudioBtn.disabled = true;
}
