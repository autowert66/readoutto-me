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

    if (res.status < 200 || res.status >= 300) {
      throw new Error('Non-ok status code');
    }

    const stream = res.body!;
    const codec = res.headers.get('Content-Type')!;

    console.log('Creating media source for res.body, type %s', codec);
    const mediaSource = new MediaSource(); // DOES NOT work on mobile safari (no ios, only ipados)
    const url = URL.createObjectURL(mediaSource);

    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.setAttribute('controls', '');
      audioContainer.appendChild(audioEl);
    }

    // clean up the old MediaSource
    if (audioEl.src) URL.revokeObjectURL(audioEl.src);
    audioEl.src = url;
    // downloadAudioBtn.disabled = false;

    mediaSource.addEventListener('sourceopen', async () => {
      console.log('source is open');

      const sourceBuffer = mediaSource.addSourceBuffer(codec);
      audioEl!.play();
      for await (const chunk of stream) {
        sourceBuffer.appendBuffer(chunk);
        await new Promise(
          (resolve) => sourceBuffer.addEventListener('updateend', resolve, { once: true }),
        );
      }

      mediaSource.endOfStream();
    }, { once: true });
  } finally {
    playAudioBtn.disabled = false;
    audioContainer.classList.remove('loading');
  }
});

downloadAudioBtn.addEventListener('click', (ev) => {
  ev.preventDefault();
  // not supported right now

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
