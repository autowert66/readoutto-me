import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/ReadOutTo/);
});

test('has header with h1', async ({ page }) => {
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('h1')).toContainText(/Read.*Out.*To/);
});

test('has github link', async ({ page }) => {
  const githubLink = page.getByText('github');

  await expect(githubLink).toBeVisible();
  await expect(githubLink).toHaveAttribute('href', /github\.com.*readoutto-me/);
});
