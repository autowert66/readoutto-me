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

test('has github link', async ({ page }) => {
  await page.goto('/');

  const githubLink = page.getByText('github');

  await expect(githubLink).toBeVisible();
  await expect(githubLink).toHaveAttribute('href', /github\.com.*readoutto-me/);
});
