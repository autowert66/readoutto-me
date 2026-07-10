import { formatErrorMessage, showSnackbar } from '../utils/showSnackbar.ts';

const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const uploadBtn = document.getElementById('upload-btn')!;
const pasteBtn = document.getElementById('paste-btn')!;

uploadBtn.addEventListener('click', (ev) => {
  ev.preventDefault();

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt, .md, .log, text/plain, text/markdown';
  input.click();

  // input and listener are automatically garbage collected
  input.addEventListener('change', async (ev) => {
    ev.preventDefault();

    const file = input.files?.[0];
    if (!file) return;

    try {
      if (file.size > 1024 * 64) {
        throw new Error('File size is too large.');
      }

      let text = await file.text();
      text = text.trim();

      if (!text) {
        throw new Error('File has no text to read.');
      }

      toreadTextarea.value = text;
    } catch (err) {
      showSnackbar(formatErrorMessage('Failed to upload text', err), 'error');
    }
  }, { once: true });
});

pasteBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();

  try {
    const clip = await navigator.clipboard.readText();
    toreadTextarea.value = clip;
  } catch {
    showSnackbar('Failed to read Clipboard', 'default');
  }
});
