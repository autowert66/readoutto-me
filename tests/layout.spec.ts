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

  const githubLink = await page.getByText('github');

  await expect(githubLink).toBeVisible();

  const href = await githubLink.getAttribute('href');
  await expect(href).toBeTruthy();

  let url: URL;
  await expect(() => url = new URL(href!)).not.toThrowError();
  await expect(url!.hostname).toBe('github.com');
  await expect(url!.pathname).toMatch(/readoutto\-me/);
});
