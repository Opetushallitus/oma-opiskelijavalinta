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
} from './mocks';
import type { HakemusResponse } from '@/lib/hakemus-service';
import { addDays, format } from 'date-fns';
import { KOUTA_DATE_FORMAT, toFinnishDate } from '@/lib/time-utils';
import type { HakutoiveenTulosDto } from '@/lib/valinta-tulos-types';

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
        paatettavatOpiskeluOikeudet: [
          {
            tunniste: 'tunniste-1',
            organisaatioOid: '',
            organisaatioNimi: { fi: 'Valkoiset Lakanat Oy', sv: '', en: '' },
            supaNimi: { fi: 'Lakana Lisensiaatti', sv: '', en: '' },
            virtaNimi: { fi: '', sv: '', en: '' },
          },
          {
            tunniste: 'tunniste-2',
            organisaatioOid: '',
            organisaatioNimi: { fi: 'Poral', sv: '', en: '' },
            supaNimi: { fi: 'Hampaiden Poraaja', sv: '', en: '' },
            virtaNimi: { fi: '', sv: '', en: '' },
          },
        ],
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
  await expect(vastaanotot.getByText('Opiskeluoikeus päättyy')).toBeVisible();
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
    vastaanottoModal.getByText('Opiskeluoikeus päättyy'),
  ).toBeVisible();
});

test('Näyttää päättyvät opiskeluoikeudet kun jonotetaan ylempää', async ({
  page,
}) => {
  /*eslint-disable @typescript-eslint/no-non-null-assertion */
  const tulokset: Array<HakutoiveenTulosDto> = [
    hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty[0]!,
    {
      ...hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty[1]!,
      paatettavatOpiskeluOikeudet: [
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
      ],
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
        naytetytPaatettavatOpiskeluoikeudet: [
          {
            tunniste: 'tunniste-1',
            organisaatioOid: '',
            organisaatioNimi: { fi: 'Valkoiset Lakanat Oy', sv: '', en: '' },
            supaNimi: { fi: 'Lakana Lisensiaatti', sv: '', en: '' },
            virtaNimi: { fi: '', sv: '', en: '' },
          },
          {
            tunniste: 'tunniste-2',
            organisaatioOid: '',
            organisaatioNimi: { fi: 'Poral', sv: '', en: '' },
            supaNimi: { fi: 'Hampaiden Poraaja', sv: '', en: '' },
            virtaNimi: { fi: '', sv: '', en: '' },
          },
        ],
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
  await expect(hakemus.getByText('Opiskeluoikeus päättyy')).toBeVisible();
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
