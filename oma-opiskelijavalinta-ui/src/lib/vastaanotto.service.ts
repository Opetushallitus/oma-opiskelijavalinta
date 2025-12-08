import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';

async function postVastaanotto(
  hakemusOid: string,
  hakukohdeOid: string,
  vastaanotto: VastaanottoTila,
) {
  const config = await getConfiguration();
  return await client.post<string>(
    `${config.routes.vastaanotto}/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
    vastaanotto,
  );
}

export enum VastaanottoTila {
  PERU = 'Peru',
  VASTAANOTA_SITOVASTI = 'VastaanotaSitovasti',
  VASTAANOTA_SITOVASTI_PERU_ALEMMAT = 'VastaanotaSitovastiPeruAlemmat',
  VASTAANOTA_EHDOLLISESTI = 'VastaanotaEhdollisesti',
}

export async function doVastaanotto(
  hakemusOid: string,
  hakukohdeOid: string,
  vastaanotto: VastaanottoTila,
): Promise<string> {
  const response = await postVastaanotto(hakemusOid, hakukohdeOid, vastaanotto);
  return response.data;
}
