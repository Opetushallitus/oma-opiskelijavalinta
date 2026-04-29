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
  requestBody: {
    vastaanotto: VastaanottoTilaToiminto;
    hakuOid: string;
    vastaanottoKaannosAvain: string;
  },
) {
  const config = await getConfiguration();
  return await client.post<string>(
    `${config.routes.vastaanotto}/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
    requestBody,
  );
}

export function naytettavatVastaanottoTiedot(
  hakemuksenTulokset: Array<HakutoiveenTulos>,
): Array<HakutoiveenTulos> {
  return hakemuksenTulokset.filter(
    (ht) =>
      (ht.vastaanottotila &&
        ![VastaanottoTila.KESKEN].includes(ht.vastaanottotila)) ||
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
  hakuOid: string,
  vastaanottoKaannosAvain: string,
): Promise<string> {
  const requestBody = { vastaanotto, hakuOid, vastaanottoKaannosAvain };
  const response = await postVastaanotto(hakemusOid, hakukohdeOid, requestBody);
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
