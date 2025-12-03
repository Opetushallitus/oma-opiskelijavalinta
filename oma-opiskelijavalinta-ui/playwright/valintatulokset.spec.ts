import { expect, test } from '@playwright/test';
import {
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosHylatty,
  hakemuksenTulosHyvaksytty,
  hakemuksenTulosKesken,
  hakemuksenTulosVarasijalla,
  hakemus1,
  hakemus2,
} from './mocks';

test('Näyttää varasijanumeron', async ({ page }) => {
  const varasijaApplication = {
    ...hakemus1,
    hakemuksenTulokset: [hakemuksenTulosVarasijalla],
  };
  await mockApplicationsFetch(page, {
    current: [varasijaApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Olet 2. varasijalla')).toBeVisible();
});

test('Näyttää hyväksytyn tuloksen', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const app = page.getByTestId('application-hakemus-oid-2');
  await expect(
    app.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(app.getByText('Hyväksytty')).toBeVisible();
});

test('Näyttää hylätyn tuloksen', async ({ page }) => {
  const hylattyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHylatty],
  };
  await mockApplicationsFetch(page, { current: [hylattyApplication], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const app = page.getByTestId('application-hakemus-oid-2');
  await expect(
    app.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(app.getByText('Et saanut opiskelupaikkaa')).toBeVisible();
});

test('Näyttää kesken-tuloksen jos toisella hakutoiveella on julkaistu tulos', async ({
  page,
}) => {
  const varasijaApplication = {
    ...hakemus1,
    hakemuksenTulokset: [hakemuksenTulosVarasijalla, hakemuksenTulosKesken],
  };
  await mockApplicationsFetch(page, {
    current: [varasijaApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
  const applications = page.getByTestId('active-applications');

  const app1 = applications.first();
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Kesken')).toBeVisible();
});
