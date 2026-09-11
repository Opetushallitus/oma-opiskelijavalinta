import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
  mockAuthenticatedUserWithoutOppijanumero,
  mockHakemuksetFetch,
} from './lib/playwrightUtils';

test('Näyttää etusivun infoineen', async ({ page }) => {
  await setup(page);
  await expect(page).toHaveTitle('Hakemukset ja opiskelupaikan vastaanotto');
  await expect(
    page.getByText('Hakemukset ja opiskelupaikan vastaanotto'),
  ).toBeVisible();
  await expect(page.getByText('Ruhtinas Nukettaja')).toBeVisible();
  await expect(page.getByText('1.2.246.562.24.00000000001')).toBeVisible();
  await expect(
    page.getByText('Muokkaa hakemustasi ja seuraa valinnan etenemistä'),
  ).toBeVisible();
  await expect(
    page.getByText('tarkastella hakemuksiasi ja muokata niitä hakuaikana'),
  ).toBeVisible();
  await expect(
    page.getByText('lisätä liitteitä hakemuksellesi määräaikaan mennessä'),
  ).toBeVisible();
  await expect(
    page.getByText('nähdä opiskelijavalinnan tulokset'),
  ).toBeVisible();
  await expect(page.getByText('ottaa opiskelupaikan vastaan')).toBeVisible();
});

test('Etusivun saavutettavuus', async ({ page }) => {
  await setup(page);
  await expect(
    page.getByText('Hakemukset ja opiskelupaikan vastaanotto'),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});

test('Näyttää etusivun kun käyttäjällä ei ole oppijanumeroa', async ({
  page,
}) => {
  await mockAuthenticatedUserWithoutOppijanumero(page);
  await mockHakemuksetFetch(page, { current: [], old: [] });
  await page.goto('');
  await expect(
    page.getByText('Sinulla ei ole ajankohtaisia opiskelupaikan hakemuksia.'),
  ).toBeVisible();
  await expect(
    page.getByText('Sinulla ei ole aiempia hakemuksia'),
  ).toBeVisible();
});

async function setup(page: Page) {
  await mockAuthenticatedUser(page);
  await mockHakemuksetFetch(page, { current: [], old: [] });
  await page.goto('');
}
