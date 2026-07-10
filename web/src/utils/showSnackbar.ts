const errorSnackbarEl = document.getElementById('error-snackbar')!;
const errorTextEl = document.getElementById('error-text')!;

type SnackbarKind = 'error' | 'primary' | 'default' | '';

export function formatErrorMessage(message: string, error: Error | string | unknown) {
  const stringified = error instanceof Error ? error.message : String(error);
  return stringified.trim() ? `${message}: ${stringified}` : message;
}

export function showSnackbar(msg: string, kind: SnackbarKind = '') {
  if (kind === 'default') kind = '';
  errorSnackbarEl.classList = 'snackbar ' + kind;

  errorTextEl.textContent = msg;
  errorSnackbarEl.hidden = false;

  // the ui() function adds the .active class and automatically hides it,
  // and allows dismissing the snackbar interactively, see https://github.com/beercss/beercss/blob/main/docs/SNACKBAR.md#method-3
  ui(`#${errorSnackbarEl.id}`, 6_000);
}
