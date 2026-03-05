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

export const mockLinkSession = async (page: Page) => {
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authMethod: 'link',
      }),
    });
  });
};

test('Näyttää kirjautumislinkillä tunnistautuneelle etusivun ja uloskirjautumispainikkeen', async ({
  page,
}) => {
  const testToken = 'test-link-token';
  await mockLinkAuth(page, testToken);
  await mockAuthenticatedUser(page);
  await mockLinkSession(page);

  await page.goto(`oma-opiskelijavalinta/token/${testToken}`);

  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
  await expect(page.getByText('Linkki Käyttäjä')).toBeVisible();
  const logoutButton = page.getByRole('button', { name: 'Kirjaudu ulos' });
  await expect(logoutButton).toBeVisible();

  await logoutButton.click();
  await expect(page).toHaveURL('oma-opiskelijavalinta/logged-out');
  await expect(page.getByText('Olet kirjautunut ulos')).toBeVisible();
});

test('Ohjaa heikosti tunnistautuneen uloskirjautumisen jälkeen uloskirjautuneen näkymään', async ({
  page,
}) => {
  const testToken = 'test-link-token';
  await mockLinkAuth(page, testToken);
  await mockAuthenticatedUser(page);
  await mockLinkSession(page);

  await page.goto(`oma-opiskelijavalinta/token/${testToken}`);

  const logoutButton = page.getByRole('button', { name: 'Kirjaudu ulos' });
  await expect(logoutButton).toBeVisible();

  await logoutButton.click();
  await expect(page).toHaveURL('oma-opiskelijavalinta/logged-out');
  await expect(page.getByText('Olet kirjautunut ulos')).toBeVisible();
  await expect(
    page.getByText('Sinut on kirjattu ulos palvelusta'),
  ).toBeVisible();
  await expect(page.getByText('Opintopolun etusivulle')).toBeVisible();
});

test('Virheellisellä kirjautumislinkillä näytetään virhesivu', async ({
  page,
}) => {
  const testToken = 'test-link-token';
  await mockLinkAuth(page, testToken);
  await mockAuthenticatedUser(page);
  await mockLinkSession(page);

  await page.goto(`oma-opiskelijavalinta/token/foobar`);

  await expect(
    page.getByRole('heading', { name: 'Kirjautumislinkki ei toimi' }),
  ).toBeVisible();
  await expect(
    page.getByText('Käyttämäsi kirjautumislinkki ei toimi'),
  ).toBeVisible();
  const frontPageButton = page.getByRole('link', {
    name: 'Opintopolun etusivulle',
  });
  await expect(frontPageButton).toBeVisible();
});
