import { voiceManagerPromise } from '../shared/voiceManager.ts';
import { formatErrorMessage, showSnackbar } from '../utils/showSnackbar.ts';
import { VoiceManager } from '../utils/VoiceManager.ts';

const toreadTextarea = document.getElementById('toread-textarea')! as HTMLTextAreaElement;
const textareaContainer = document.getElementById('textarea-container')!;
const suggestedLangs = document.getElementById('suggested-langs')!;
const uploadBtn = document.getElementById('upload-btn')!;
const pasteBtn = document.getElementById('paste-btn')!;
const langSelect = document.getElementById('lang-select')! as HTMLSelectElement;

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
      handleTextareaUpdate();
    } catch (err) {
      showSnackbar(formatErrorMessage('Failed to upload text', err), 'error');
    }
  }, { once: true });
});

pasteBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();

  try {
    // Baseline 2024, see https://caniuse.com/mdn-api_clipboard_readtext
    // and https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
    const clip = await navigator.clipboard.readText();
    toreadTextarea.value = clip;
    handleTextareaUpdate();
  } catch {
    showSnackbar('Failed to read Clipboard', 'default');
  }
});

toreadTextarea.addEventListener('paste', handleTextareaUpdate);
/** On paste (either event or detected), trigger the language detection */
function handleTextareaUpdate() {
  // paste happens before .value is updated, defer handling
  setTimeout(() => {
    try {
      const contentURL = new URL(toreadTextarea.value.trim());
      if (!/^http/.test(contentURL.protocol)) {
        throw new Error('Not a web URL');
      }

      handleURL(contentURL);
    } catch {
      // pasted content is not a url
      detectLanguage();
    }
  }, 0);
}

/** Handle pasted url to obtain text content from the url and detect language after */
async function handleURL(contentURL: URL | string) {
  try {
    textareaContainer.classList.add('loading');
    textareaContainer.setAttribute('aria-busy', 'true');
    toreadTextarea.disabled = true;

    const url = `https://cf.markdown.download/?url=${encodeURIComponent(contentURL.toString())}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'text/markdown' },
      // time out after 8s, e.g. when the website does not respond and then markdown.download can't respond either
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Non-successful status code obtaining text.');
    }

    const text = await res.text();
    console.log('Obtained article text:\n%s', text);

    const processedText = preprocessMarkdownDownload(text);
    if (!processedText) {
      throw new Error('Website not supported.');
    }

    toreadTextarea.value = processedText;
    detectLanguage();
  } catch (err) {
    showSnackbar(formatErrorMessage('Failed to obtain text from URL', err), 'error');
  } finally {
    textareaContainer.classList.remove('loading');
    textareaContainer.removeAttribute('aria-busy');
    toreadTextarea.disabled = false;
  }
}

/** Preprocess content from markdown.download specifically (regular markdown cleanup is applied before reading) */
function preprocessMarkdownDownload(content: string) {
  // remove original article url at the end
  content = content.replace(/https?:\S+\s*$/, '');
  // trim content
  content = content.trim();
  return content;
}

let eldPromise: Promise<typeof import('eld/extrasmall')['eld']> | undefined;
/** Dynamically load the language detection model, detect the language and suggest changes if confidence is sufficient */
async function detectLanguage() {
  try {
    // dynamically import the eld (efficient language detector) package, only when needed. Keep loaded for subsequent use
    eldPromise ||= import('eld/extrasmall').then((module) => module.eld);
    const timeoutPromise: Promise<never> = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Language detection timeout')), 2_500);
    });

    // wait for eldPromise and voiceManagerPromise, or time out after timeoutPromise rejects
    const [eld, voiceManager] = await Promise.race([
      Promise.all([eldPromise, voiceManagerPromise]),
      timeoutPromise,
    ]);

    const value = toreadTextarea.value.trim();
    const detection = eld.detect(value);
    const { language } = detection;

    const lastDetection = suggestedLangs.getAttribute('data-detection') || '';
    if (lastDetection === language) return;

    suggestedLangs.replaceChildren();
    suggestedLangs.removeAttribute('data-detection');

    const selectedLang = langSelect.value;
    if (!detection.isReliable() || selectedLang.startsWith(language)) return;

    const languages = voiceManager.getVoicesByLanguagePrefix(language);
    if (!languages.length) return;

    suggestedLangs.setAttribute('data-detection', language);
    for (const lang of languages) {
      const btn = document.createElement('button');
      btn.classList.add('chip', 'transparent');
      btn.textContent = VoiceManager.getLanguageDisplayName(lang);
      btn.setAttribute('data-lang', lang);
      btn.addEventListener('click', handleSuggestedChipClick);
      suggestedLangs.appendChild(btn);
    }

    const dismissBtn = document.createElement('button');
    const dismissIcon = document.createElement('i');
    dismissBtn.classList.add('chip', 'round', 'transparent', 'dismiss-suggestions-btn');
    dismissIcon.textContent = 'close';
    dismissBtn.appendChild(dismissIcon);
    dismissBtn.addEventListener('click', handleDismissSuggestionsClick);
    suggestedLangs.appendChild(dismissBtn);
  } catch (err) {
    // Failure to detect the language is not an issue, it can be silently ignored (-> no language detection shows up)
    console.warn('Language detection failed with Error:', err);
  }
}

function handleSuggestedChipClick(ev: PointerEvent) {
  ev.preventDefault();
  const target = ev.target as HTMLButtonElement;
  const lang = target.getAttribute('data-lang');

  // remove the highlight of the highlighted chip and highlight the current one
  suggestedLangs.querySelector('.fill')?.classList.remove('fill');
  target.classList.add('fill');

  // update the selected language
  langSelect.value = lang!;
  langSelect.dispatchEvent(new Event('change'));
}

function handleDismissSuggestionsClick(ev: PointerEvent) {
  ev.preventDefault();
  suggestedLangs.replaceChildren();
  suggestedLangs.removeAttribute('data-detection');
}
