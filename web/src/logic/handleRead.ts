import { client } from '../utils/client.ts';
import { makeAsyncIterable } from '../utils/makeAsyncIterator.ts';

const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const voiceSelect = document.getElementById('voice-select')! as HTMLSelectElement;
const playAudioBtn = document.getElementById('play-audio-btn')! as HTMLButtonElement;
const downloadAudioBtn = document.getElementById('download-audio-btn')! as HTMLButtonElement;
const audioContainer = document.getElementById('audioContainer')!;

let audioEl: HTMLAudioElement | undefined;
let blobPromise: Promise<Blob> | undefined;

// see: https://bitmovin.com/blog/managed-media-source/#migration-from-mse-to-mms-ed4921d7-725c-4010-b3d0-d32af2f44964
function getMediaSource() {
  if ('MediaSource' in window as unknown) {
    return new window.MediaSource();
  } else if ('ManagedMediaSource' in window) {
    // since safari 17 as a replacement for the not implemented MediaSource, see https://caniuse.com/wf-managed-media-source
    return new (window as { ManagedMediaSource: typeof window['MediaSource'] })
      .ManagedMediaSource();
  }

  throw new Error('No MediaSource API available');
}

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

    const [stream, downloadStream] = res.body!.tee();
    const codec = res.headers.get('Content-Type')!;

    blobPromise = new Response(downloadStream, {
      headers: {
        'Content-Type': codec,
      },
    }).blob();

    console.log('Creating media source for res.body, type %s', codec);
    const mediaSource = getMediaSource();
    const url = URL.createObjectURL(mediaSource);

    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.setAttribute('controls', '');
      // required for ManagedMediaSource, see https://developer.mozilla.org/en-US/docs/Web/API/ManagedMediaSource#examples
      audioEl.disableRemotePlayback = true;
      audioContainer.appendChild(audioEl);
    }

    // clean up the old MediaSource
    if (audioEl.src) URL.revokeObjectURL(audioEl.src);
    audioEl.src = url;

    mediaSource.addEventListener('sourceopen', async () => {
      console.log('source is open');

      const sourceBuffer = mediaSource.addSourceBuffer(codec);
      audioEl!.play();
      for await (const chunk of makeAsyncIterable(stream)) {
        sourceBuffer.appendBuffer(chunk as BufferSource);
        await new Promise(
          (resolve) => sourceBuffer.addEventListener('updateend', resolve, { once: true }),
        );
      }

      mediaSource.endOfStream();
      downloadAudioBtn.disabled = false;
    }, { once: true });
  } finally {
    playAudioBtn.disabled = false;
    audioContainer.classList.remove('loading');
  }
});

downloadAudioBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();

  if (!blobPromise) return;
  const blob = await blobPromise;
  const blobURL = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobURL;
  a.download = 'generated-speech.webm';
  a.click();

  // prevent holding blob in memory forever
  setTimeout(() => {
    URL.revokeObjectURL(blobURL);
  }, 1000);
});

// workaround for cases where reloading the page does not actually apply the disabled tag again
if (!audioEl) {
  downloadAudioBtn.disabled = true;
}
