import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';

async function postVastaanotto(hakemusOid: string, hakukohdeOid: string) {
  const config = await getConfiguration();
  return await client.post<string>(
    `${config.routes.vastaanotto}/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
    '',
  );
}

export async function doVastaanotto(
  hakemusOid: string,
  hakukohdeOid: string,
): Promise<string> {
  const response = await postVastaanotto(hakemusOid, hakukohdeOid);
  return response.data;
}
