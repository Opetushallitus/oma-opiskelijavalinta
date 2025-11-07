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
};

async function fetchApplications() {
  const config = await getConfiguration();
  return await client.get<Array<Application>>(
    config.routes.hakemukset.hakemuksetUrl,
  );
}

export async function getApplications(): Promise<Array<Application>> {
  const response = await fetchApplications();
  return response.data;
}
