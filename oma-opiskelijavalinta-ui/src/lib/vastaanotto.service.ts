import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import {
  VastaanottoTila,
  VastaanottoTilaToiminto,
  type HakutoiveenTulos,
} from './valinta-tulos-types';

async function postVastaanotto(
  hakemusOid: string,
  hakukohdeOid: string,
  vastaanotto: VastaanottoTilaToiminto,
) {
  const config = await getConfiguration();
  return await client.post<string>(
    `${config.routes.vastaanotto}/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
    vastaanotto,
  );
}

export function naytettavatVastaanottoTiedot(
  hakemuksenTulokset: Array<HakutoiveenTulos>,
) {
  return hakemuksenTulokset.filter(
    (ht) =>
      (ht.vastaanottotila &&
        ![
          VastaanottoTila.KESKEN,
          VastaanottoTila.PERUUTETTU,
          VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN,
        ].includes(ht.vastaanottotila)) ||
      (ht.vastaanotettavuustila &&
        ht.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA'),
  );
}

export function onkoVastaanottoTehty(
  hakemuksenTulokset: Array<HakutoiveenTulos>,
) {
  return hakemuksenTulokset.some(
    (ht) => ht.vastaanottotila && ht.vastaanottotila !== VastaanottoTila.KESKEN,
  );
}

export async function doVastaanotto(
  hakemusOid: string,
  hakukohdeOid: string,
  vastaanotto: VastaanottoTilaToiminto,
): Promise<string> {
  const response = await postVastaanotto(hakemusOid, hakukohdeOid, vastaanotto);
  return response.data;
}

async function postIlmoittautuminen(
  hakemusOid: string,
  hakukohdeOid: string,
  hakuOid: string,
  ilmoittautumisTila: 'LASNA' | 'LASNA_KOKO_LUKUVUOSI',
) {
  const config = await getConfiguration();
  return await client.post<string>(
    `${config.routes.ilmoittautuminen}/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
    {
      hakuOid,
      ilmoittautumisTila,
    },
  );
}

export async function doIlmoittautuminen(
  hakemusOid: string,
  hakukohdeOid: string,
  hakuOid: string,
  kevatIlmoittautuminen: boolean,
): Promise<string> {
  const ilmoittautumisTila = kevatIlmoittautuminen
    ? 'LASNA'
    : 'LASNA_KOKO_LUKUVUOSI';
  const response = await postIlmoittautuminen(
    hakemusOid,
    hakukohdeOid,
    hakuOid,
    ilmoittautumisTila,
  );
  return response.data;
}
