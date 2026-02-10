import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockHakemuksetFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosVastaanotettu,
  hakemus1,
  hakemus3ToinenAste,
} from './mocks';

test('Näyttää ilmoittauduttavan hakutoiveen', async ({ page }) => {
  await setup(page);
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-3')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-3-hakukohde-oid-4',
  );
  await expect(
    ilmoittautuminen.getByText('Läsnä koko lukuvuoden'),
  ).toBeVisible();
  await expect(
    ilmoittautuminen.getByRole('button', { name: 'Lähetä ilmoittautuminen' }),
  ).toBeVisible();
});

test('Ilmoittautuminen on saavutettava', async ({ page }) => {
  await setup(page);
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-3')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-3-hakukohde-oid-4',
  );
  await expect(
    ilmoittautuminen.getByText('Läsnä koko lukuvuoden'),
  ).toBeVisible();

  await expectPageAccessibilityOk(page);
});

test('Ilmoittautumismodaali on saavutettava', async ({ page }) => {
  await setup(page);
  await page.addStyleTag({
    content: '* {animation: none !important; transition: none !important; }',
  });
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-3')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-3-hakukohde-oid-4',
  );
  await ilmoittautuminen
    .getByRole('checkbox', { name: 'Läsnä koko lukuvuoden' })
    .click();
  const sendButton = ilmoittautuminen.getByRole('button', {
    name: 'Lähetä ilmoittautuminen',
  });
  await sendButton.click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeVisible();

  await expectPageAccessibilityOk(page);
});

test('Lähettää ilmoittautumisen onnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/ilmoittautuminen/hakemus/hakemus-oid-3/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-3/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          vastaanotettuHakemus({ ilmoittauduttu: true }).hakemuksenTulokset,
        ),
      });
    },
  );
  await setup(page);
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-3')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-3-hakukohde-oid-4',
  );
  await ilmoittautuminen
    .getByRole('checkbox', { name: 'Läsnä koko lukuvuoden' })
    .click();
  const sendButton = ilmoittautuminen.getByRole('button', {
    name: 'Lähetä ilmoittautuminen',
  });
  await sendButton.click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeVisible();
  await page.getByRole('button', { name: 'Lähetä ilmoittautuminen' }).click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeHidden();
  //ilmoitus näkyy ja suljetaan se
  await expect(
    page.getByText('Lukuvuosi-ilmoittautuminen onnistui'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sulje' }).click();
  await expect(
    page.getByText('Lukuvuosi-ilmoittautuminen onnistui'),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByRole('button', { name: 'Lähetä ilmoittautuminen' }),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByText(
      'Olet ilmoittautunut 2.2.2026 klo 15:00 vastauksella: Läsnä koko lukuvuoden',
    ),
  ).toBeVisible();
});

test('Lähettää ilmoittautumisen epäonnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/ilmoittautuminen/hakemus/hakemus-oid-3/**',
    async (route) => {
      await route.fulfill({
        status: 500,
      });
    },
  );
  await setup(page);
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-3')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-3-hakukohde-oid-4',
  );
  await ilmoittautuminen
    .getByRole('checkbox', { name: 'Läsnä koko lukuvuoden' })
    .click();
  const sendButton = ilmoittautuminen.getByRole('button', {
    name: 'Lähetä ilmoittautuminen',
  });
  await sendButton.click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeVisible();
  await page.getByRole('button', { name: 'Lähetä ilmoittautuminen' }).click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeHidden();
  //ilmoitus näkyy ja suljetaan se
  await expect(
    page.getByText('Lukuvuosi-ilmoittautuminen epäonnistui'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sulje' }).click();
  await expect(
    page.getByText('Lukuvuosi-ilmoittautuminen epäonnistui'),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByRole('button', { name: 'Lähetä ilmoittautuminen' }),
  ).toBeVisible();
});

test('Näyttää ilmoittauduttavan hakutoiveen korkeakouluhakuun', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus1,
        hakemuksenTulokset: [
          {
            ...hakemuksenTulosVastaanotettu,
            ilmoittautumistila: {
              ilmoittautumistila: 'EI_TEHTY',
              ilmoittauduttavissa: true,
              ilmoittautumistapa: {
                nimi: { fi: 'Oili', sv: 'Oili', en: 'Oili' },
                url: '/oili/',
              },
            },
          },
        ],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-1')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-1-hakukohde-oid-1',
  );
  await expect(
    ilmoittautuminen.getByText('Läsnä koko lukuvuoden'),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByText('Muista tehdä lukuvuosi-'),
  ).toBeVisible();
  await expect(
    ilmoittautuminen.getByText('Saadaksesi opiskeluoikeuden'),
  ).toBeVisible();
  await expect(
    ilmoittautuminen.getByRole('button', { name: 'Lähetä ilmoittautuminen' }),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByRole('link', { name: 'Siirry ilmoittautumaan' }),
  ).toBeVisible();
});

test('Näyttää hakutoiveen jossa on ilmoittautuminen korkeakouluhaussa', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus1,
        hakemuksenTulokset: [
          {
            ...hakemuksenTulosVastaanotettu,
            ilmoittautumistila: {
              ilmoittautumistila: 'LASNA_KOKO_LUKUVUOSI',
              ilmoittauduttavissa: false,
              ilmoittautumistapa: {
                nimi: { fi: 'Oili', sv: 'Oili', en: 'Oili' },
                url: '/oili/',
              },
            },
            ilmoittautumisenAikaleima: '2026-03-03T13:00:00Z',
          },
        ],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-1')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-1-hakukohde-oid-1',
  );
  await expect(
    ilmoittautuminen.getByText('Läsnä koko lukuvuoden'),
  ).toBeVisible();
  await expect(
    ilmoittautuminen.getByText('Muista tehdä lukuvuosi-'),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByText('Saadaksesi opiskeluoikeuden'),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByRole('button', { name: 'Lähetä ilmoittautuminen' }),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByRole('link', { name: 'Siirry ilmoittautumaan' }),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByText('Lukuvuosi-ilmoittautuminen'),
  ).toBeVisible();
  await expect(
    ilmoittautuminen.getByText(
      'Olet ilmoittautunut 3.3.2026 klo 15:00 vastauksella: Läsnä koko lukuvuoden',
    ),
  ).toBeVisible();
});

test('Näyttää ja ilmoittautuu kevätkaudelle kun hakuun on sellainen määritelty', async ({
  page,
}) => {
  await page.route(
    '**/api/ilmoittautuminen/hakemus/hakemus-oid-3/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-3/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          vastaanotettuHakemus({ ilmoittauduttu: true, kausi: 'kausi_k' })
            .hakemuksenTulokset,
        ),
      });
    },
  );
  await setup(page, 'kausi_k');
  await expect(
    page
      .getByTestId('vastaanotot-hakemus-oid-3')
      .getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
  const ilmoittautuminen = page.getByTestId(
    'ilmoittautuminen-hakemus-oid-3-hakukohde-oid-4',
  );
  await ilmoittautuminen
    .getByRole('checkbox', { name: 'Läsnä kevään' })
    .click();
  const sendButton = ilmoittautuminen.getByRole('button', {
    name: 'Lähetä ilmoittautuminen',
  });
  await sendButton.click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeVisible();
  await page.getByRole('button', { name: 'Lähetä ilmoittautuminen' }).click();
  await expect(page.getByText('Olet vahvistamassa lukuvuosi-')).toBeHidden();
  //ilmoitus näkyy ja suljetaan se
  await expect(
    page.getByText('Lukuvuosi-ilmoittautuminen onnistui'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sulje' }).click();
  await expect(
    page.getByText('Lukuvuosi-ilmoittautuminen onnistui'),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByRole('button', { name: 'Lähetä ilmoittautuminen' }),
  ).toBeHidden();
  await expect(
    ilmoittautuminen.getByText(
      'Olet ilmoittautunut 2.2.2026 klo 15:00 vastauksella: Läsnä kevään',
    ),
  ).toBeVisible();
});

const vastaanotettuHakemus = ({
  ilmoittauduttu = false,
  kausi = 'kausi_s',
}: {
  ilmoittauduttu?: boolean;
  kausi?: 'kausi_s' | 'kausi_k';
}) => {
  return {
    ...hakemus3ToinenAste,
    haku: { ...hakemus3ToinenAste.haku, koulutuksenAlkamiskausi: kausi },
    hakemuksenTulokset: [
      {
        ...hakemus3ToinenAste.hakemuksenTulokset[0],
        vastaanottotila: 'VASTAANOTTANUT_SITOVASTI',
        vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
        ilmoittautumistila: {
          ilmoittautumisaika: {},
          ilmoittautumistila: ilmoittauduttu
            ? kausi === 'kausi_s'
              ? 'LASNA_KOKO_LUKUVUOSI'
              : 'LASNA'
            : 'EI_TEHTY',
          ilmoittauduttavissa: !ilmoittauduttu,
        },
        ilmoittautumisenAikaleima: ilmoittauduttu
          ? '2026-02-02T13:00:00Z'
          : null,
      },
    ],
  };
};

async function setup(page: Page, kausi: 'kausi_s' | 'kausi_k' = 'kausi_s') {
  await mockHakemuksetFetch(page, {
    current: [vastaanotettuHakemus({ kausi })],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
}
