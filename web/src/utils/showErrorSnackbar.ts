const errorSnackbarEl = document.getElementById('error-snackbar')!;
const errorTextEl = document.getElementById('error-text')!;

export function showErrorSnackbar(err: Error | string | unknown) {
  errorTextEl.textContent = 'Failed to play audio: ';
  errorTextEl.textContent += err instanceof Error ? err.message : String(err || '<unknown issue>');
  errorSnackbarEl.hidden = false;

  // the ui() function adds the .active class and automatically hides it,
  // and allows dismissing the snackbar interactively, see https://github.com/beercss/beercss/blob/main/docs/SNACKBAR.md#method-3
  ui(`#${errorSnackbarEl.id}`, 6_000);
}
