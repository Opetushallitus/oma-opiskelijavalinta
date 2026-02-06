import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { TranslatedName } from './localization/localization-types';
import type { Haku, Hakukohde } from './kouta-types';
import { type HakutoiveenTulosDto, Valintatila } from './valinta-tulos-types';
import type { Hakemus, Hakemukset } from './hakemus-types';

type Ohjausparametrit = {
  hakukierrosPaattyy?: number | null;
  ilmoittautuminenPaattyy?: number | null;
  valintaTuloksetJulkaistaanHakijoilleAlkaa?: number | null;
  valintaTuloksetJulkaistaanHakijoillePaattyy?: number | null;
  ehdollisetValinnatPaattyy?: number | null;
  opiskelijanPaikanVastaanottoPaattyy?: number | null;
  varasijatayttoPaattyy?: number | null;
  sijoittelu?: boolean;
  jarjestetytHakutoiveet?: boolean;
};

export type HakemusResponse = {
  oid: string;
  haku: Haku;
  hakukohteet: Array<Hakukohde>;
  secret?: string;
  ohjausparametrit?: Ohjausparametrit;
  submitted: string;
  processing: boolean;
  formName: TranslatedName;
  hakemuksenTulokset: Array<HakutoiveenTulosDto>;
};

type HakemuksetResponse = {
  current: Array<HakemusResponse>;
  old: Array<HakemusResponse>;
};

async function fetchHakemukset() {
  const config = await getConfiguration();
  return await client.get<HakemuksetResponse>(
    config.routes.hakemukset.hakemuksetUrl,
  );
}

function convertToHakemus(app: HakemusResponse, muokkausUrl: string): Hakemus {
  const modifyLink = app.secret ? `${muokkausUrl}=${app.secret}` : null;
  const hakukierrosPaattyy = app.ohjausparametrit?.hakukierrosPaattyy;
  const varasijatayttoPaattyy = app.ohjausparametrit?.varasijatayttoPaattyy;
  const valintaTuloksetJulkaistaanHakijoilleAlkaa =
    app.ohjausparametrit?.valintaTuloksetJulkaistaanHakijoilleAlkaa;
  const valintaTuloksetJulkaistaanHakijoillePaattyy =
    app.ohjausparametrit?.valintaTuloksetJulkaistaanHakijoillePaattyy;
  return {
    ...app,
    modifyLink,
    hakukierrosPaattyy,
    varasijatayttoPaattyy,
    valintaTuloksetJulkaistaanHakijoilleAlkaa,
    valintaTuloksetJulkaistaanHakijoillePaattyy,
    priorisoidutHakutoiveet:
      app.ohjausparametrit?.jarjestetytHakutoiveet === true,
    sijoitteluKaytossa: app.ohjausparametrit?.sijoittelu === true,
    submitted: new Date(app.submitted).getTime(),
    hakemuksenTulokset: app.hakemuksenTulokset?.map((tulos) => ({
      ...tulos,
      valintatila: tulos.valintatila as Valintatila,
      jonokohtaisetTulostiedot: tulos.jonokohtaisetTulostiedot.map((jono) => ({
        ...jono,
        valintatila: jono.valintatila as Valintatila,
      })),
      ilmoittautuminen: {
        ...tulos.ilmoittautumistila,
        ilmoittautumisenAikaleima: tulos.ilmoittautumisenAikaleima,
      },
    })),
  };
}

export async function getHakemukset(): Promise<Hakemukset> {
  const config = await getConfiguration();
  const response = await fetchHakemukset();
  const muokkausUrl = config.routes.hakemukset.muokkausUrl;
  const current = response.data.current
    .map((app) => convertToHakemus(app, muokkausUrl))
    .sort((a, b) => b.submitted - a.submitted);
  const old = response.data.old
    .map((app) => convertToHakemus(app, muokkausUrl))
    .sort((a, b) => b.submitted - a.submitted);
  return { current, old };
}
