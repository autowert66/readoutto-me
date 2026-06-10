// beer css supports light/dark mode and switches automatically, but does not handle switching while on the page
// this helper listens for changes to the media query and forces it to apply the changes instantly

if ('matchMedia' in window) {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', () => ui('mode', 'auto'));
}
