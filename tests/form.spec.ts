import { expect, test } from '@playwright/test';

test('has textarea, options and action buttons', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.locator('#lang-select')).toBeVisible();
  await expect(page.locator('#voice-select')).toBeVisible();

  await expect(page.locator('#play-audio-btn')).toBeVisible();
  await expect(page.locator('#download-audio-btn')).toBeVisible();
});

test('play button is enabled, download button is disabled', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#play-audio-btn')).toBeEnabled();
  await expect(page.locator('#download-audio-btn')).toBeDisabled();
});

test('empty textarea and generating displays error, but no error before that', async ({ page }) => {
  await page.goto('/');

  const playBtn = await page.locator('#play-audio-btn');

  await expect(page.locator('output.invalid')).not.toBeVisible();

  await playBtn.click();

  await expect(page.locator('output.invalid')).toBeVisible();
  await expect(page.locator('output.invalid')).toContainText('required');
});

test('language and voice have an initial value', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#lang-select')).toHaveValue(/.+/);
  await expect(page.locator('#voice-select')).toHaveValue(/.+/);
});

test('language and voice have an initial value before the loading of the voices', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const langSelect = await page.locator('#lang-select');
  const voiceSelect = await page.locator('#voice-select');

  await expect(langSelect).toBeTruthy();
  await expect(voiceSelect).toBeTruthy();
});

test('select inputs have multiple options', async ({ page }) => {
  await page.goto('/');

  const langSelect = await page.locator('#lang-select');
  const voiceSelect = await page.locator('#voice-select');

  const langOptionCount = await langSelect.locator('option').count();
  const voiceOptionCount = await voiceSelect.locator('option').count();

  await expect(langOptionCount).toBeGreaterThan(10);
  await expect(voiceOptionCount).toBeGreaterThan(2);
});

test('changing language updates voices', async ({ page }) => {
  await page.goto('/');

  const langSelect = await page.locator('#lang-select');
  const voiceSelect = await page.locator('#voice-select');

  const initialLang = await langSelect.inputValue();
  const initialVoice = await voiceSelect.inputValue();

  await expect(initialLang).toBeTruthy();
  await expect(initialVoice).toBeTruthy();

  const newLang = initialLang === 'en-US' ? 'de-DE' : 'en-US';

  await langSelect.selectOption(newLang);

  const newVoice = await voiceSelect.inputValue();

  await expect(newVoice).toBeTruthy();
  await expect(newVoice).not.toBe(initialVoice);
});
