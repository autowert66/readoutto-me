import { client } from '../utils/client.ts';

const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const voiceSelect = document.getElementById('voice-select')! as HTMLSelectElement;
const playAudioBtn = document.getElementById('play-audio-btn')!;
const audioContainer = document.getElementById('audioContainer')!;

let audioEl: HTMLAudioElement;

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
    }, { once: true });

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
