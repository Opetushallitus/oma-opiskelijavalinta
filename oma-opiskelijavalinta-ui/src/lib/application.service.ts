import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { TranslatedName } from './localization/localization-types';

export type Haku = {
  oid: string;
  nimi: TranslatedName;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
};

export type Application = {
  oid: string;
  haku: Haku;
  hakukohteet: Array<Hakukohde>;
  modifyLink?: string | null;
  hakukierrosPaattyy?: number | null;
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
};

async function fetchApplications() {
  const config = await getConfiguration();
  return await client.get<Array<ApplicationResponse>>(
    config.routes.hakemukset.hakemuksetUrl,
  );
}

export async function getApplications(): Promise<Array<Application>> {
  const config = await getConfiguration();
  const response = await fetchApplications();
  return response.data.map((app) => {
    const modifyLink = app.secret
      ? `${config.routes.hakemukset.muokkausUrl}=${app.secret}`
      : null;
    const hakukierrosPaattyy = app.ohjausparametrit?.hakukierrosPaattyy;
    return {
      ...app,
      modifyLink,
      hakukierrosPaattyy,
    };
  });
}
