import { test, expect } from '@playwright/test';

test.describe('Lokalisointi', () => {
  test('Kääntää sivun suomeksi', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveTitle(/Oma Opiskelijavalinta/);
    await expect(page.getByText('Ajankohtaiset hakemukset')).toBeVisible();
    await expect(page.getByText('hakemukset.ajankohtaiset')).toBeHidden();
    await expect(page.getByText('info.kuvaus')).toBeHidden();
  });

  test('Kääntää sivun englanniksi', async ({ page, context }) => {
    await context.addCookies([
      { name: 'lang', value: 'en', path: '/', domain: 'localhost' },
    ]);
    await page.goto('');
    await expect(page).toHaveTitle(/Oma Opiskelijavalinta/);
    await expect(page.getByText('Ajankohtaiset hakemukset')).toBeHidden();
    await expect(page.getByText('hakemukset.ajankohtaiset')).toBeHidden();
    await expect(
      page.getByText('Current applications', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('info.kuvaus')).toBeVisible();
  });

  test('Kääntää sivun ruotsiksi', async ({ page, context }) => {
    await context.addCookies([
      { name: 'lang', value: 'sv', path: '/', domain: 'localhost' },
    ]);
    await page.goto('');
    await expect(page).toHaveTitle(/Oma Opiskelijavalinta/);
    await expect(page.getByText('Ajankohtaiset hakemukset')).toBeHidden();
    await expect(page.getByText('hakemukset.ajankohtaiset')).toBeVisible();
    await expect(page.getByText('info.kuvaus')).toBeVisible();
  });
});
