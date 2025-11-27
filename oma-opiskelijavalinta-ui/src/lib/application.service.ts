import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { TranslatedName } from './localization/localization-types';

export type Haku = {
  oid: string;
  nimi: TranslatedName;
  hakuaikaKaynnissa: boolean;
  viimeisinPaattynytHakuAika: string;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
};

export type Application = {
  oid: string;
  haku?: Haku | null;
  hakukohteet?: Array<Hakukohde>;
  modifyLink?: string | null;
  hakukierrosPaattyy?: number | null;
  submitted: number;
  formName: TranslatedName;
};

export type Applications = {
  current: Array<Application>;
  old: Array<Application>;
};

type Ohjausparametrit = {
  hakukierrosPaattyy?: number | null;
  ilmoittautuminenPaattyy?: number | null;
  valintaTuloksetJulkaistaanHakijoille?: number | null;
  ehdollisetValinnatPaattyy?: number | null;
  opiskelijanPaikanVastaanottoPaattyy?: number | null;
};

type ApplicationResponse = {
  oid: string;
  haku: Haku;
  hakukohteet: Array<Hakukohde>;
  secret?: string;
  ohjausparametrit?: Ohjausparametrit;
  submitted: string;
  formName: TranslatedName;
};

type ApplicationsResponse = {
  current: Array<ApplicationResponse>;
  old: Array<ApplicationResponse>;
};

async function fetchApplications() {
  const config = await getConfiguration();
  return await client.get<ApplicationsResponse>(
    config.routes.hakemukset.hakemuksetUrl,
  );
}

function convertToApplication(
  app: ApplicationResponse,
  muokkausUrl: string,
): Application {
  const modifyLink = app.secret ? `${muokkausUrl}=${app.secret}` : null;
  const hakukierrosPaattyy = app.ohjausparametrit?.hakukierrosPaattyy;
  return {
    ...app,
    modifyLink,
    hakukierrosPaattyy,
    submitted: new Date(app.submitted).getTime(),
  };
}

export async function getApplications(): Promise<Applications> {
  const config = await getConfiguration();
  const response = await fetchApplications();
  const muokkausUrl = config.routes.hakemukset.muokkausUrl;
  const current = response.data.current
    .map((app) => convertToApplication(app, muokkausUrl))
    .sort((a, b) => a.submitted - b.submitted);
  const old = response.data.old
    .map((app) => convertToApplication(app, muokkausUrl))
    .sort((a, b) => a.submitted - b.submitted);
  return { current, old };
}
