import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/ReadOutTo/);
});

test('has header with h1', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('h1')).toContainText(/Read.*Out.*To/);
});
