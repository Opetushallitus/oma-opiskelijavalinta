import { test, expect, type Page } from '@playwright/test';

const mockLinkAuth = async (page: Page, validToken = 'test-link-token') => {
  await page.route('**/api/link-login*', async (route) => {
    const url = new URL(route.request().url());
    const token = url.searchParams.get('token');

    if (token === validToken) {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ok',
        }),
      });
    } else {
      await route.fulfill({
        status: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid token' }),
      });
    }
  });
  await page.route('**/api/link-logout*', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    });
  });
};

export const mockAuthenticatedUser = async (page: Page) => {
  await page.route('**/api/user', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kutsumanimi: 'Linkki',
        sukunimi: 'Käyttäjä',
        oppijanumero: '1.2.246.562.24.00000000002',
      }),
    });
  });
};

test('Link login + logout flow', async ({ page }) => {
  const testToken = 'test-link-token';
  await mockLinkAuth(page, testToken);
  await mockAuthenticatedUser(page);

  await page.goto(`oma-opiskelijavalinta/token/${testToken}`);

  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();

  const logoutButton = page.getByRole('button', { name: 'Kirjaudu ulos' });
  await expect(logoutButton).toBeVisible();
  await expect(page.getByText('Linkki Käyttäjä')).toBeVisible();

  await logoutButton.click();
  await expect(page).toHaveURL('oma-opiskelijavalinta/logged-out');
  await expect(page.getByText('Olet kirjautunut ulos')).toBeVisible();
});
