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
  secret?: string;
  modifyLink?: string;
};

async function fetchApplications() {
  const config = await getConfiguration();
  return await client.get<Array<Application>>(
    config.routes.hakemukset.hakemuksetUrl,
  );
}

export async function getApplications(): Promise<Array<Application>> {
  const config = await getConfiguration();
  const response = await fetchApplications();
  return response.data.map((app) => {
    const modifyLink = `${config.routes.hakemukset.muokkausUrl}=${app.secret}`;
    return {
      ...app,
      modifyLink,
    };
  });
}
