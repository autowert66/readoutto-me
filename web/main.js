/** @type {HTMLTextAreaElement} */
const toreadTextarea = document.getElementById('toread-textarea');
const playAudioBtn = document.getElementById('play-audio-btn');

let audioEl;

// dynamically import dynamic-theme in a non-blocking way since it is not critical (promise is not awaited)
import('./utils/dynamic-theme.js');

playAudioBtn.addEventListener('click', (ev) => {
  ev.preventDefault();

  const { value } = toreadTextarea;
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
  searchParams.set('t', Date.now()); // unique query parameter to bypass the cache
  audioEl.src = '/api/read?' + searchParams.toString();
  audioEl.play();
});
