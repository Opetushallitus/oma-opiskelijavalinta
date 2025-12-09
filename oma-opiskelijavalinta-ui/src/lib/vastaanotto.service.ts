import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { Application } from './application-types';
import {
  VastaanottoTila,
  VastaanottoTilaToiminto,
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

export function naytettavatVastaanottoTiedot(application: Application) {
  return application.hakemuksenTulokset.filter(
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

export async function doVastaanotto(
  hakemusOid: string,
  hakukohdeOid: string,
  vastaanotto: VastaanottoTilaToiminto,
): Promise<string> {
  const response = await postVastaanotto(hakemusOid, hakukohdeOid, vastaanotto);
  return response.data;
}
