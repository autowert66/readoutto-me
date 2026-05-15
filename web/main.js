const playAudioBtn = document.getElementById('playAudio');
let audioEl;

// dynamically import dynamic-theme in a non-blocking way since it is not critical (promise is not awaited)
import('./utils/dynamic-theme.js');

playAudioBtn.addEventListener('click', (ev) => {
  ev.preventDefault();

  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.setAttribute('controls', '');
    document.body.appendChild(audioEl);
  }

  // append a unique query parameter to trigger a new request and bypass the cache
  audioEl.src = `/api/helloworld.webm?t=${Date.now()}`;
  audioEl.play();
});
