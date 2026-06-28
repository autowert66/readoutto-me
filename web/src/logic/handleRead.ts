import { client } from '../utils/client.ts';
import { makeAsyncIterable } from '../utils/makeAsyncIterable.ts';
import { showErrorSnackbar } from '../utils/showErrorSnackbar.ts';

const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const voiceSelect = document.getElementById('voice-select')! as HTMLSelectElement;
const playAudioBtn = document.getElementById('play-audio-btn')! as HTMLButtonElement;
const downloadAudioBtn = document.getElementById('download-audio-btn')! as HTMLButtonElement;
const audioContainer = document.getElementById('audioContainer')!;

let audioEl: HTMLAudioElement | undefined;
// maximum audio duration is ~10min, so keeping the blob in memory is no issue (<5-10mb)
let blobPromise: Promise<Blob> | undefined;
let playAbortController: AbortController | undefined;

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

const MAX_TEXT_LENGTH = 18_000;

function showValidationError(element: HTMLTextAreaElement, message: string) {
  const parent = element.parentElement!;
  if (parent.querySelector('output')) return;

  const output = document.createElement('output');
  output.textContent = message;
  parent.appendChild(output);

  parent.classList.add('invalid');
  output.classList.add('invalid');

  element.addEventListener('input', () => {
    parent.classList.remove('invalid');
    output.remove();
  }, { once: true });
}

playAudioBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();

  const { value } = toreadTextarea;
  const voice = voiceSelect.value;

  if (!value) {
    showValidationError(toreadTextarea, 'Text to read is required');
    return;
  }

  if (value.length > MAX_TEXT_LENGTH) {
    showValidationError(
      toreadTextarea,
      `Text exceeds maximum length of ${MAX_TEXT_LENGTH.toLocaleString()} characters`,
    );
    return;
  }

  // AbortController to cancel requests, streaming and playback on regeneration
  if (playAbortController) playAbortController.abort();
  playAbortController = new AbortController();
  const { signal } = playAbortController;

  playAudioBtn.disabled = true;
  downloadAudioBtn.disabled = true;
  audioContainer.classList.add('loading');

  try {
    const res = await client.api.read.$post({
      json: {
        text: value,
        voice: voice,
      },
    }, { init: { signal } });

    if (res.status < 200 || res.status >= 300) {
      throw new Error('Non-ok status code');
    }

    const codec = res.headers.get('Content-Type')!;

    console.log('Creating MediaSource for res.body, codec %s!', codec);
    const mediaSource = getMediaSource();
    const codecIsSupported = (mediaSource.constructor as typeof MediaSource).isTypeSupported(codec);

    if (!codecIsSupported) {
      throw new Error(`Browser / MediaSource does not support codec ${codec}.`);
    }

    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.setAttribute('controls', '');
      // required for ManagedMediaSource, see https://developer.mozilla.org/en-US/docs/Web/API/ManagedMediaSource#examples
      audioEl.disableRemotePlayback = true;
      audioContainer.appendChild(audioEl);
    }

    const url = URL.createObjectURL(mediaSource);
    audioEl.src = url;
    signal.addEventListener('abort', () => {
      URL.revokeObjectURL(url);
    }, { once: true });

    // ReadableStream can only be consumed once, so .tee it for the two purposes: playback and download
    const [stream, downloadStream] = res.body!.tee();
    blobPromise = new Response(downloadStream, {
      headers: {
        'Content-Type': codec,
      },
    }).blob();

    blobPromise.then(() => {
      if (signal.aborted) return;
      downloadAudioBtn.disabled = false;
    }).catch(() => {});

    // creating the source buffer requires waiting for the sourceopen event
    mediaSource.addEventListener('sourceopen', async () => {
      try {
        console.log('MediaSource: source is open');

        const sourceBuffer = mediaSource.addSourceBuffer(codec);
        audioEl!.play().catch(() => {
          // auto-play failed due to browser restrictions, but controls are visible so user can play manually
        });

        for await (const chunk of makeAsyncIterable(stream)) {
          if (signal.aborted) break;
          sourceBuffer.appendBuffer(chunk as BufferSource);
          await new Promise(
            (resolve) =>
              sourceBuffer.addEventListener('updateend', resolve, { once: true, signal }),
          );
        }

        console.log('MediaSource loop: End of audio stream');
        mediaSource.endOfStream();
      } catch (err) {
        stream.cancel().catch(() => {});

        if (signal.aborted) {
          return console.info('Sourceopen error after abort:', err);
        }

        console.error('Error in sourceopen MediaStream handler:\n%o', err);
        showErrorSnackbar(err);
      }
    }, { once: true, signal });
  } catch (err) {
    if (signal.aborted) {
      return console.info('Play audio error after abort:', err);
    }

    console.error('Failed to play audio:\n%o', err);
    showErrorSnackbar(err);
  } finally {
    playAudioBtn.disabled = false;
    audioContainer.classList.remove('loading');
  }
});

let downloadBlobURL: string | undefined;
downloadAudioBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();

  if (!blobPromise) return;
  if (downloadBlobURL) URL.revokeObjectURL(downloadBlobURL);

  const blob = await blobPromise;
  downloadBlobURL = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = downloadBlobURL;
  a.download = 'generated-speech.webm';
  a.click();
});

// workaround for cases where reloading the page does not actually apply the disabled tag again
if (!audioEl) {
  downloadAudioBtn.disabled = true;
}
