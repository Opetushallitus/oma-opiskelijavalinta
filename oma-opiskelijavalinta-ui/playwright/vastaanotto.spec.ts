import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa,
  hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty,
  hakemuksenTuloksiaYlinHyvaksyttyAlimmatPeruuntuneet,
  hakemuksenTulosHyvaksytty,
  hakemus1,
  hakemus2,
  hakemus3ToinenAste,
  hakemus4ToinenAsteAlempiaHyvaksyttyja,
} from './mocks';
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
  await expect(
    vastaanotot.getByText('Sinulle tarjotaan opiskelupaikkaa hakutoiveesta'),
  ).toBeHidden();
});

test('Näyttää monesko hakutoive on vastaanotettavissa priorisoidussa haussa', async ({
  page,
}) => {
  await setup(page, {
    ...hakemus1,
    hakemuksenTulokset:
      hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Sinulle tarjotaan opiskelupaikkaa hakutoiveesta 2'),
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
  await setup(page, {
    ...hakemus3ToinenAste,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-3');
  await expect(
    vastaanotot.getByText('Otan tämän opiskelupaikan vastaan', { exact: true }),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Otan tämän opiskelupaikan vastaan ja perun aiem'),
  ).toBeHidden();
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
  await expect(
    page.getByText('Huomioithan, että et voi ottaa muuta'),
  ).toBeHidden();
  await page.getByRole('button', { name: 'Peruuta' }).click();
  await expect(
    page.getByText('Vahvista opiskelupaikan vastaanotto'),
  ).toBeHidden();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Näyttää peruutettavan vahvistusdialogin lähetettäessä vastaanottoa korkeakouluhaulle', async ({
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
  await expect(
    page.getByText('Huomioithan, että et voi ottaa muuta'),
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
  //ilmoitus näkyy ja suljetaan se
  await expect(
    page.getByText('Opiskelupaikka vastaanotettu onnistuneesti'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sulje' }).click();
  await expect(
    page.getByText('Opiskelupaikka vastaanotettu onnistuneesti'),
  ).toBeHidden();
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

test('Lähettää ehdollisen vastaanoton onnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty),
      });
    },
  );
  await setup(page, {
    ...hakemus1,
    hakemuksenTulokset:
      hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await vastaanotot
    .getByRole('radio', {
      name: 'Otan tämän opiskelupaikan vastaan. Jään myös jonottamaan',
    })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(page.getByText('Jäät jonottamaan ylempiä')).toBeVisible();
  await page
    .getByRole('button', { name: 'Ota opiskelupaikka vastaan' })
    .click();
  //ilmoitus näkyy ja suljetaan se
  await expect(
    page.getByText('Opiskelupaikka vastaanotettu onnistuneesti'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sulje' }).click();
  await expect(
    page.getByText('Opiskelupaikka vastaanotettu onnistuneesti'),
  ).toBeHidden();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText(
      'Opiskelupaikka vastaanotettu, jonottaa ylempiä hakutoiveita',
      { exact: true },
    ),
  ).toBeVisible();
});

test('Lähettää vastaanoton onnistuneesti peruen aiemmat vastaanotot', async ({
  page,
}) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-4/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-4/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          hakemuksenTuloksiaYlinHyvaksyttyAlimmatPeruuntuneet,
        ),
      });
    },
  );
  await setup(page, {
    ...hakemus4ToinenAsteAlempiaHyvaksyttyja,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-4');
  await expect(
    vastaanotot.getByText('Kun otat tämän opiskelupaikan'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Otan tämän opiskelupaikan vastaan', { exact: true }),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Otan tämän opiskelupaikan vastaan ja perun aiemmin'),
  ).toBeVisible();
  await vastaanotot
    .getByRole('radio', {
      name: 'Otan tämän opiskelupaikan vastaan ja perun aiemmin',
    })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(
    page.getByText('Vahvista opiskelupaikan vastaanotto'),
  ).toBeVisible();
  await expect(
    page
      .getByLabel('Vahvista opiskelupaikan')
      .getByText('Rekun Lukio, Helsingin'),
  ).toBeVisible();
  await expect(
    page.getByText('Seuraavat aiemmin vastaanottamasi opiskelupaikat perutaan'),
  ).toBeVisible();
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: 'Romuttamo, Romujenkerääjät' }),
  ).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Putkittamo, Putket Vuotaa' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Ota opiskelupaikka vastaan' })
    .click();
  await expect(
    page.getByText('Vahvista opiskelupaikan vastaanotto'),
  ).toBeHidden();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeHidden();
  await expect(
    vastaanotot.getByText('Opiskelupaikka vastaanotettu', { exact: true }),
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

test('Vastaanottomodaali on saavutettava', async ({ page }) => {
  await setup(page);

  await page.addStyleTag({
    content: '* {animation: none !important; transition: none !important; }',
  });

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
  await expect(
    page.getByText('Olet vahvistamassa opiskelupaikan vastaanottoa:'),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Peruuta' })).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Ota opiskelupaikka vastaan' }),
  ).toBeVisible();

  await expectPageAccessibilityOk(page);
});

const vastaanotettuTulos = (vastaanottoTila: VastaanottoTila) => {
  const tulos = clone(hakemuksenTulosHyvaksytty);
  tulos.vastaanotettavuustila = 'EI_VASTAANOTETTAVISSA';
  tulos.vastaanottotila = vastaanottoTila;
  return tulos;
};

async function setup(
  page: Page,
  overridableApplication?: Record<string, object | string>,
) {
  const hyvaksyttyApplication = overridableApplication ?? {
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
