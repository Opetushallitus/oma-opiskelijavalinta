import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { TranslatedName } from './localization/localization-types';
import type { Haku, Hakukohde } from './kouta-types';
import type { HakutoiveenTulos } from './valinta-tulos-types';
import type { Application, Applications } from './application-types';

type Ohjausparametrit = {
  hakukierrosPaattyy?: number | null;
  ilmoittautuminenPaattyy?: number | null;
  valintaTuloksetJulkaistaanHakijoille?: number | null;
  ehdollisetValinnatPaattyy?: number | null;
  opiskelijanPaikanVastaanottoPaattyy?: number | null;
  varasijatayttoPaattyy?: number | null;
  sijoittelu?: boolean;
  jarjestetytHakutoiveet?: boolean;
};

type ApplicationResponse = {
  oid: string;
  haku: Haku;
  hakukohteet: Array<Hakukohde>;
  secret?: string;
  ohjausparametrit?: Ohjausparametrit;
  submitted: string;
  formName: TranslatedName;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
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
  const varasijatayttoPaattyy = app.ohjausparametrit?.varasijatayttoPaattyy;
  return {
    ...app,
    modifyLink,
    hakukierrosPaattyy,
    varasijatayttoPaattyy,
    priorisoidutHakutoiveet:
      app.ohjausparametrit?.jarjestetytHakutoiveet === true,
    sijoitteluKaytossa: app.ohjausparametrit?.sijoittelu === true,
    submitted: new Date(app.submitted).getTime(),
  };
}

export async function getApplications(): Promise<Applications> {
  const config = await getConfiguration();
  const response = await fetchApplications();
  const muokkausUrl = config.routes.hakemukset.muokkausUrl;
  const current = response.data.current
    .map((app) => convertToApplication(app, muokkausUrl))
    .sort((a, b) => b.submitted - a.submitted);
  const old = response.data.old
    .map((app) => convertToApplication(app, muokkausUrl))
    .sort((a, b) => b.submitted - a.submitted);
  return { current, old };
}
