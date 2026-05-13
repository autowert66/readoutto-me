const playAudioBtn = document.getElementById('playAudio');
let audioEl;

playAudioBtn.addEventListener('click', (ev) => {
  ev.preventDefault();

  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.setAttribute('controls', '');
    document.body.appendChild(audioEl);
  }

  // append a unique query parameter to trigger a new request and bypass the cache
  audioEl.src = `/helloworld.webm?t=${Date.now()}`;
  audioEl.play();
});
