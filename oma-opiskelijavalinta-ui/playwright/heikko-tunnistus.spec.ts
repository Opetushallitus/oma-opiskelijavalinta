import { test, expect, type Page } from '@playwright/test';
import { hakemus1, hakemus3ToinenAste } from './mocks';
import {
  expectPageAccessibilityOk,
  mockHakemuksetFetch,
} from './lib/playwrightUtils';
import type { HakemusResponse } from '@/lib/hakemus-service';

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

const mockAuthenticatedUser = async (page: Page) => {
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

const mockLinkSession = async (page: Page) => {
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

const TEST_TOKEN = 'test-link-token';

async function initPage(
  page: Page,
  hakemukset: {
    old: Array<HakemusResponse>;
    current: Array<HakemusResponse>;
  } = { old: [], current: [hakemus1] },
) {
  await mockLinkAuth(page, TEST_TOKEN);
  await mockAuthenticatedUser(page);
  await mockLinkSession(page);
  await mockHakemuksetFetch(page, hakemukset);
}

test.describe('Heikko tunnistautuminen: kirjautumislogiikka', () => {
  test.beforeEach(async ({ page }) => {
    await initPage(page);
  });

  test('Näyttää kirjautumislinkillä tunnistautuneelle etusivun ja uloskirjautumispainikkeen', async ({
    page,
  }) => {
    await page.goto(`oma-opiskelijavalinta/token/${TEST_TOKEN}`);

    await expect(page.getByText('Opiskelupaikan vastaanotto')).toBeVisible();
    await expect(page.getByText('Linkki Käyttäjä')).toBeVisible();
    const logoutButton = page.getByRole('button', { name: 'Kirjaudu ulos' });
    await expect(logoutButton).toBeVisible();
  });

  test('Virheellisellä kirjautumislinkillä näytetään virhesivu', async ({
    page,
  }) => {
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
});

test.describe('Heikko tunnistautuminen: hakemukset', () => {
  test('Näyttää aktiivisen hakemuksen', async ({ page }) => {
    await initPage(page);
    await page.goto(`oma-opiskelijavalinta/token/${TEST_TOKEN}`);
    await expect(page.getByText('Opiskelupaikan vastaanotto')).toBeVisible();
    await expect(page.getByText('Linkki Käyttäjä')).toBeVisible();
    await expect(
      page.getByText('nähdä opiskelijavalinnan tulokset'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Hurrikaaniopiston erillishaku' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Muokkaa hakemusta' }),
    ).toBeVisible();
    await expect(
      page.getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
    ).toBeVisible();
    await expect(page.getByText('Hurrikaaniopisto, Myrskynsilm')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Opiskelijavalintojen tulokset' }),
    ).toBeHidden();
  });

  test('Näyttää menneen hakemuksen', async ({ page }) => {
    await initPage(page, { current: [], old: [hakemus3ToinenAste] });
    await page.goto(`oma-opiskelijavalinta/token/${TEST_TOKEN}`);

    const logoutButton = page.getByRole('button', { name: 'Kirjaudu ulos' });
    await expect(logoutButton).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Toisten asteen yhteishaku 2024',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Opiskelijavalintojen tulokset' }),
    ).toBeVisible();
  });
});

test('Heikko tunnistautuminen: saavutettavuus', async ({ page }) => {
  await initPage(page);
  await page.goto(`oma-opiskelijavalinta/token/${TEST_TOKEN}`);
  await expect(page.getByText('Opiskelupaikan vastaanotto')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Hurrikaaniopiston erillishaku' }),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});
