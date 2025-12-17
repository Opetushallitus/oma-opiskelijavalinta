import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import { hakemuksenTulosHyvaksytty, hakemus2 } from './mocks';
import { clone } from 'remeda';
import { VastaanottoTila } from '@/lib/valinta-tulos-types';

test('Näyttää vastaanotettavan hakutoiveen', async ({ page }) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Hyväksytty')).toBeVisible();
  await expect(
    vastaanotot.getByText('Otan tämän opiskelupaikan'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('En ota tätä opiskelupaikkaa'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Näyttää virheen lähettäessä vastausta ilman vastaanoton valintaa', async ({
  page,
}) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByText('Pakollinen tieto. Valitse yksi vaihtoehto.'),
  ).toBeHidden();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(
    vastaanotot.getByText('Pakollinen tieto. Valitse yksi vaihtoehto.'),
  ).toBeVisible();
});

test('Näyttää peruutettavan vahvistusdialogin lähetettäessä vastaanottoa', async ({
  page,
}) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await vastaanotot
    .getByRole('radio', { name: 'Otan tämän opiskelupaikan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(
    page.getByText('Vahvista opiskelupaikan vastaanotto'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Peruuta' }).click();
  await expect(
    page.getByText('Vahvista opiskelupaikan vastaanotto'),
  ).toBeHidden();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Lähettää vastaanoton onnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-2/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-2/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          vastaanotettuTulos(VastaanottoTila.VASTAANOTTANUT_SITOVASTI),
        ]),
      });
    },
  );
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await vastaanotot
    .getByRole('radio', { name: 'Otan tämän opiskelupaikan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page
    .getByRole('button', { name: 'Ota opiskelupaikka vastaan' })
    .click();
  await expect(
    page.getByText('Opiskelupaikka vastaanotettu onnistuneesti'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeHidden();
  await expect(
    vastaanotot.getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
});

test('Lähettää vastaanoton epäonnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-2/**',
    async (route) => {
      await route.fulfill({
        status: 500,
      });
    },
  );
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await vastaanotot
    .getByRole('radio', { name: 'Otan tämän opiskelupaikan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page
    .getByRole('button', { name: 'Ota opiskelupaikka vastaan' })
    .click();
  await expect(page.getByText('Vastaanottotoiminto epäonnistui')).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Peruu vastaanoton onnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-2/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-2/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([vastaanotettuTulos(VastaanottoTila.PERUNUT)]),
      });
    },
  );
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await vastaanotot
    .getByRole('radio', { name: 'En ota tätä opiskelupaikkaa' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page
    .getByRole('button', { name: 'En ota opiskelupaikkaa vastaan' })
    .click();
  await expect(
    page.getByText('Opiskelupaikkaa ei vastaanotettu.'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeHidden();
  await expect(
    vastaanotot.getByText('Opiskelupaikkaa ei vastaanotettu', { exact: true }),
  ).toBeVisible();
});

test('Vastaanotto on saavutettava', async ({ page }) => {
  await setup(page);

  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();

  await expectPageAccessibilityOk(page);
});

const vastaanotettuTulos = (vastaanottoTila: VastaanottoTila) => {
  const tulos = clone(hakemuksenTulosHyvaksytty);
  tulos.vastaanotettavuustila = 'EI_VASTAANOTETTAVISSA';
  tulos.vastaanottotila = vastaanottoTila;
  return tulos;
};

async function setup(page: Page) {
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
}
