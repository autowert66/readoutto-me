import { expect, type Page, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function testGenerationResults({ page }: { page: Page }) {
  await page.getByRole('button', { name: 'Play Audio' }).click();

  const loadingIndicator = page.locator('.loading-indicator');
  await expect(loadingIndicator).toBeVisible();
  await expect(loadingIndicator).toBeHidden();

  const audioEl = page.locator('audio');
  await expect(audioEl).toBeVisible();
  await expect(audioEl).toHaveAttribute('src', /.+/);

  const downloadBtn = page.getByRole('button', { name: 'Download' });
  await expect(downloadBtn).not.toBeDisabled();

  const downloadPromise = page.waitForEvent('download');
  await downloadBtn.click();
  const download = await downloadPromise;

  // without calling saveAs, the download happens to a temporary folder and is cleaned up automatically
  // await download.saveAs(download.suggestedFilename());

  const downloadFailure = await download.failure();
  await expect(downloadFailure).toBeNull();
}

test('minimal reading', async ({ page }) => {
  const textarea = page.getByRole('textbox', { name: 'Text to read' });
  await textarea.fill(
    'Hey, this is ReadOutTo dot me. On this page, you can read any text out aloud in natural voices, with support for many languages and the ability to download generated speech.',
  );

  await testGenerationResults({ page });
});

test('switch language and voice', async ({ page }) => {
  const textarea = page.getByRole('textbox', { name: 'Text to read' });
  await textarea.fill(
    'Hola, esto es ReadOutTo.me. En esta página puedes escuchar cualquier texto leído en voz alta con voces naturales; admite muchos idiomas y te permite descargar el audio generado.',
  );

  await page.getByLabel('Language').selectOption({ value: 'es-ES' });
  await page.getByLabel('Speaker').selectOption({ value: 'es-ES-AlvaroNeural' });

  await testGenerationResults({ page });
});
