import { expect, test, type Page } from '@playwright/test';
import {
  mockHakemuksetFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosVastaanotettu,
  hakemuksenTulosHyvaksytty,
  hakemus2,
  hakukohde3,
  mockSession,
  hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty,
  hakemus1,
  hakukohde1Yps,
  hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa,
  hakemuksenTuloksiaYlempiVarallaAlempiVastaanotettuEhdollinen,
} from './mocks';
import type { HakemusResponse } from '@/lib/hakemus-service';
import { addDays, format } from 'date-fns';
import { KOUTA_DATE_FORMAT, toFinnishDate } from '@/lib/time-utils';
import {
  type HakutoiveenTulosDto,
  type PaatettavaOpiskeluOikeus,
} from '@/lib/valinta-tulos-types';

/*eslint-disable @typescript-eslint/no-non-null-assertion */

const PAATETTAVAT_OPISKELUOIKEUDET: Array<PaatettavaOpiskeluOikeus> = [
  {
    tunniste: 'tunniste-1',
    organisaatioOid: '',
    organisaatioNimi: { fi: 'Valkoiset Lakanat Oy', sv: '', en: '' },
    supaNimi: { fi: 'Lakana Lisensiaatti', sv: '', en: '' },
    virtaNimi: { fi: 'Lakana', sv: '', en: '' },
  },
  {
    tunniste: 'tunniste-2',
    organisaatioOid: '',
    organisaatioNimi: { fi: 'Poral', sv: '', en: '' },
    supaNimi: { fi: 'Hampaiden Poraaja', sv: '', en: '' },
    virtaNimi: { fi: 'Poraaja', sv: '', en: '' },
  },
] as const;

const PAATETTAVAT_OPISKELUOIKEUDET_VARASIJALLA: Array<PaatettavaOpiskeluOikeus> =
  [
    {
      tunniste: 'tunniste-3',
      organisaatioOid: '',
      organisaatioNimi: {
        fi: 'Hervannan Purkanpurijoiden AMK',
        sv: '',
        en: '',
      },
      supaNimi: { fi: 'Hammashygienisti', sv: '', en: '' },
      virtaNimi: { fi: '', sv: '', en: '' },
    },
    PAATETTAVAT_OPISKELUOIKEUDET[0]!,
    {
      tunniste: 'tunniste-4',
      organisaatioOid: '',
      organisaatioNimi: { fi: 'Rotamon rotevat rotat', sv: '', en: '' },
      supaNimi: { fi: 'Eläinlääketieteen lisensiaatti', sv: '', en: '' },
      virtaNimi: { fi: '', sv: '', en: '' },
    },
  ];

test('Näyttää päättyvät opiskeluoikeudet kk-haun vastaanotossa', async ({
  page,
}) => {
  const dateInFuture = format(
    addDays(toFinnishDate(new Date()), 1),
    KOUTA_DATE_FORMAT,
  );
  const hyvaksyttyPrioKkApplication = {
    ...hakemus2,
    hakukohteet: [{ ...hakukohde3, koulutuksenAlkamisPvm: dateInFuture }],
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        paatettavatOpiskeluOikeudet: PAATETTAVAT_OPISKELUOIKEUDET,
      },
    ],
  };
  await setup(page, hyvaksyttyPrioKkApplication);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(
    vastaanotot.getByText('Opiskeluoikeutesi päätetään'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('link', { name: 'Lisätietoja yhden' }),
  ).toBeVisible();

  await vastaanotot
    .getByRole('radio', { name: 'Otan tämän opiskelupaikan' })
    .click();
  await vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }).click();
  await expect(
    page.getByText('Vahvista opiskelupaikan vastaanotto'),
  ).toBeVisible();
  const vastaanottoModal = page.getByLabel(
    'Vahvista opiskelupaikan vastaanotto',
  );
  await expect(
    vastaanottoModal.getByRole('heading', {
      name: 'Aiemmat opiskeluoikeutesi pää',
    }),
  ).toBeVisible();
  await expect(
    vastaanottoModal.getByText('Valkoiset Lakanat Oy'),
  ).toBeVisible();
  await expect(vastaanottoModal.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanottoModal.getByText('Poral')).toBeVisible();
  await expect(vastaanottoModal.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(
    vastaanottoModal.getByText('Opiskeluoikeutesi päätetään'),
  ).toBeVisible();
});

test('Näyttää päättyvät opiskeluoikeudet kun jonotetaan ylempää', async ({
  page,
}) => {
  const tulokset: Array<HakutoiveenTulosDto> = [
    hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty[0]!,
    {
      ...hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty[1]!,
      paatettavatOpiskeluOikeudet: PAATETTAVAT_OPISKELUOIKEUDET,
    },
  ];
  await setup(page, { ...hakemus1, hakemuksenTulokset: tulokset });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');

  await expect(
    vastaanotot.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana', { exact: true })).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(vastaanotot.getByText('Poraaja', { exact: true })).toBeVisible();
  await expect(
    vastaanotot.getByText('Opiskeluoikeutesi päätetään ennen uuden'),
  ).toBeVisible();

  await vastaanotot.getByText('Luovun jonotuksesta ja muutan').click();
  await vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }).click();
  await expect(
    page.getByText('Vahvista jonotuksesta luopuminen'),
  ).toBeVisible();
  const luopumisModal = page.getByLabel('Vahvista jonotuksesta luopuminen');
  await expect(
    luopumisModal.getByRole('heading', {
      name: 'Aiemmat opiskeluoikeutesi pää',
    }),
  ).toBeVisible();
  await expect(luopumisModal.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(luopumisModal.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(
    luopumisModal.getByText('Lakana', { exact: true }),
  ).toBeVisible();
  await expect(luopumisModal.getByText('Poral')).toBeVisible();
  await expect(luopumisModal.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(
    luopumisModal.getByText('Poraaja', { exact: true }),
  ).toBeVisible();
  await expect(
    luopumisModal.getByText('Opiskeluoikeutesi päätetään ennen uuden'),
  ).toBeVisible();
});

test('Näyttää päättyvät opiskeluoikeudet vastaanotetussa hakemuksessa', async ({
  page,
}) => {
  const dateInFuture = format(
    addDays(toFinnishDate(new Date()), 1),
    KOUTA_DATE_FORMAT,
  );
  const hyvaksyttyPrioKkApplication = {
    ...hakemus2,
    hakukohteet: [{ ...hakukohde1Yps, koulutuksenAlkamisPvm: dateInFuture }],
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosVastaanotettu,
        naytetytPaatettavatOpiskeluoikeudet: PAATETTAVAT_OPISKELUOIKEUDET,
      },
    ],
  };
  await setup(page, hyvaksyttyPrioKkApplication);
  const hakemus = page.getByTestId('application-hakemus-oid-2');
  await expect(
    hakemus.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeVisible();
  await expect(hakemus.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(hakemus.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(hakemus.getByText('Poral')).toBeVisible();
  await expect(hakemus.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(hakemus.getByText('Opiskeluoikeutesi päätetään')).toBeVisible();
  await expect(
    hakemus.getByRole('link', { name: 'Lisätietoja yhden' }),
  ).toBeVisible();

  await expect(
    hakemus.getByRole('radio', { name: 'Otan tämän opiskelupaikan' }),
  ).toBeHidden();
  await expect(
    hakemus.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeHidden();
});

test('Lähettää ehdollisen vastaanoton päätettävillä opintooikeuksilla onnistuneesti', async ({
  page,
}) => {
  const tulokset =
    hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa;
  tulokset[1]!.paatettavatOpiskeluOikeudet = PAATETTAVAT_OPISKELUOIKEUDET;
  await setup(page, {
    ...hakemus1,
    hakemuksenTulokset: tulokset,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Ehdollinen opiskelijavalinta'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Todistus suorituksesta X pit'),
  ).toBeVisible();

  await expect(vastaanotot.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana', { exact: true })).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(vastaanotot.getByText('Poraaja', { exact: true })).toBeVisible();
  await expect(
    vastaanotot.getByText('Opiskeluoikeutesi päätetään ennen uuden'),
  ).toBeVisible();

  await vastaanotot
    .getByRole('radio', {
      name: 'Otan tämän opiskelupaikan vastaan sitovasti',
    })
    .click();

  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  const tuloksetResponse =
    hakemuksenTuloksiaYlempiVarallaAlempiVastaanotettuEhdollinen;
  tuloksetResponse[1]!.naytetytPaatettavatOpiskeluoikeudet =
    PAATETTAVAT_OPISKELUOIKEUDET;

  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tuloksetResponse),
      });
    },
  );

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
    vastaanotot.getByText(
      'Huomioithan, että opiskelijavalintasi on ehdollinen',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Todistus suorituksesta X pit'),
  ).toBeVisible();

  await expect(
    vastaanotot.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(
    vastaanotot.getByText(
      'Seuraavat opiskeluoikeudet päättyvät kun olet toiminut',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('link', { name: 'Lisätietoja yhden' }),
  ).toBeVisible();
});

test('Varasijoilla olevat päätettävät opiskeluoikeudet näytetään', async ({
  page,
}) => {
  const tulokset = hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty;
  tulokset[0]!.paatettavatOpiskeluOikeudet =
    PAATETTAVAT_OPISKELUOIKEUDET_VARASIJALLA;
  tulokset[1]!.paatettavatOpiskeluOikeudet = PAATETTAVAT_OPISKELUOIKEUDET;
  await setup(page, {
    ...hakemus1,
    hakemuksenTulokset: tulokset,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');

  await expect(
    vastaanotot.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeVisible();

  await expect(
    vastaanotot.getByText('Valkoiset Lakanat Oy').first(),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Lakana Lisensiaatti').first(),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Lakana', { exact: true }).first(),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(vastaanotot.getByText('Poraaja', { exact: true })).toBeVisible();
  await expect(
    vastaanotot.getByText('Opiskeluoikeutesi päätetään ennen uuden'),
  ).toBeVisible();

  await expect(
    vastaanotot.getByRole('heading', { name: 'Varasijoihin liittyvät pää' }),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Hakutoive 1: Hurrikaaniopisto'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Hervannan Purkanpurijoiden AMK'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Hammashygienisti')).toBeVisible();
  await expect(vastaanotot.getByText('Rotamon rotevat rotat')).toBeVisible();
  await expect(
    vastaanotot.getByText('Eläinlääketieteen lisensiaatti'),
  ).toBeVisible();
});

test('Varasijoilla olevat päätettävät opiskeluoikeudet näytetään vaikka vastaanotettavalla ei niitä olisikaan', async ({
  page,
}) => {
  const tulokset = hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty;
  tulokset[0]!.paatettavatOpiskeluOikeudet =
    PAATETTAVAT_OPISKELUOIKEUDET_VARASIJALLA;
  await setup(page, {
    ...hakemus1,
    hakemuksenTulokset: tulokset,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');

  await expect(
    vastaanotot.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeHidden();

  await expect(vastaanotot.getByText('Poral')).toBeHidden();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeHidden();
  await expect(vastaanotot.getByText('Poraaja', { exact: true })).toBeHidden();
  await expect(
    vastaanotot.getByText('Opiskeluoikeutesi päätetään ennen uuden'),
  ).toBeVisible();

  await expect(
    vastaanotot.getByRole('heading', { name: 'Varasijoihin liittyvät pää' }),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Hakutoive 1: Hurrikaaniopisto'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Hervannan Purkanpurijoiden AMK'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Hammashygienisti')).toBeVisible();
  await expect(vastaanotot.getByText('Rotamon rotevat rotat')).toBeVisible();
  await expect(
    vastaanotot.getByText('Eläinlääketieteen lisensiaatti'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana', { exact: true })).toBeVisible();

  await expect(
    vastaanotot.getByRole('link', { name: 'Lisätietoja yhden' }),
  ).toBeVisible();
});

test('Lähettää ehdollisen vastaanoton päätettävillä opintooikeuksilla onnistuneesti joilla on varasijoja', async ({
  page,
}) => {
  const tulokset =
    hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa;
  tulokset[0]!.paatettavatOpiskeluOikeudet =
    PAATETTAVAT_OPISKELUOIKEUDET_VARASIJALLA;
  tulokset[1]!.paatettavatOpiskeluOikeudet = PAATETTAVAT_OPISKELUOIKEUDET;
  await setup(page, {
    ...hakemus1,
    hakemuksenTulokset: tulokset,
  });
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Ehdollinen opiskelijavalinta'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Todistus suorituksesta X pit'),
  ).toBeVisible();

  await expect(
    vastaanotot.getByText('Valkoiset Lakanat Oy').first(),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Lakana Lisensiaatti').first(),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Lakana', { exact: true }).first(),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(vastaanotot.getByText('Poraaja', { exact: true })).toBeVisible();
  await expect(
    vastaanotot.getByText('Opiskeluoikeutesi päätetään ennen uuden'),
  ).toBeVisible();

  await expect(
    vastaanotot.getByRole('heading', { name: 'Varasijoihin liittyvät pää' }),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Hakutoive 1: Hurrikaaniopisto'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Hervannan Purkanpurijoiden AMK'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Hammashygienisti')).toBeVisible();
  await expect(vastaanotot.getByText('Rotamon rotevat rotat')).toBeVisible();
  await expect(
    vastaanotot.getByText('Eläinlääketieteen lisensiaatti'),
  ).toBeVisible();

  await vastaanotot
    .getByRole('radio', {
      name: 'Otan tämän opiskelupaikan vastaan sitovasti',
    })
    .click();

  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  const tuloksetResponse =
    hakemuksenTuloksiaYlempiVarallaAlempiVastaanotettuEhdollinen;
  tuloksetResponse[1]!.naytetytPaatettavatOpiskeluoikeudet =
    PAATETTAVAT_OPISKELUOIKEUDET;

  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tuloksetResponse),
      });
    },
  );

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
    vastaanotot.getByText(
      'Huomioithan, että opiskelijavalintasi on ehdollinen',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('Todistus suorituksesta X pit'),
  ).toBeVisible();

  await expect(
    vastaanotot.getByRole('heading', { name: 'Aiemmat opiskeluoikeutesi pää' }),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Valkoiset Lakanat Oy')).toBeVisible();
  await expect(vastaanotot.getByText('Lakana Lisensiaatti')).toBeVisible();
  await expect(vastaanotot.getByText('Poral')).toBeVisible();
  await expect(vastaanotot.getByText('Hampaiden Poraaja')).toBeVisible();
  await expect(
    vastaanotot.getByText(
      'Seuraavat opiskeluoikeudet päättyvät kun olet toiminut',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('link', { name: 'Lisätietoja yhden' }),
  ).toBeVisible();

  await expect(
    vastaanotot.getByRole('heading', { name: 'Varasijoihin liittyvät pää' }),
  ).toBeHidden();
  await expect(
    vastaanotot.getByText('Hakutoive 1: Hurrikaaniopisto'),
  ).toBeHidden();
  await expect(
    vastaanotot.getByText('Hervannan Purkanpurijoiden AMK'),
  ).toBeHidden();
  await expect(vastaanotot.getByText('Hammashygienisti')).toBeHidden();
  await expect(vastaanotot.getByText('Rotamon rotevat rotat')).toBeHidden();
  await expect(
    vastaanotot.getByText('Eläinlääketieteen lisensiaatti'),
  ).toBeHidden();
});

async function setup(page: Page, overridableApplication?: HakemusResponse) {
  const hyvaksyttyApplication = overridableApplication ?? {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await mockHakemuksetFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await mockSession(page);
  await page.goto('');
}
