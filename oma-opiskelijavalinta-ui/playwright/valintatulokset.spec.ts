import { expect, test } from '@playwright/test';
import {
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosHylatty,
  hakemuksenTulosHyvaksytty,
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
  const applications = page.getByTestId('active-applications');

  const app1 = applications.first();
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
  const applications = page.getByTestId('active-applications');

  const app1 = applications.first();
  await expect(
    app1.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Hyväksytty')).toBeVisible();
});

test('Näyttää hylätyn tuloksen', async ({ page }) => {
  const hylattyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHylatty],
  };
  await mockApplicationsFetch(page, { current: [hylattyApplication], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');
  const applications = page.getByTestId('active-applications');

  const app1 = applications.first();
  await expect(
    app1.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Et saanut opiskelupaikkaa')).toBeVisible();
});

test('Näyttää kesken-tuloksen jos toisella hakutoiveella on julkaistu tulos', async ({
  page,
}) => {
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
  const applications = page.getByTestId('active-applications');

  const app1 = applications.first();
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Kesken')).toBeVisible();
});
// Case näyttää kesken-tilan jos hakuaika on loppu ja ei ole julkaistuja tuloksia
