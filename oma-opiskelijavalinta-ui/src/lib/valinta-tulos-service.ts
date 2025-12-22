import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import { type HakutoiveenTulos } from './valinta-tulos-types';

async function fetchValintaTulokset(hakemusOid: string, hakuOid: string) {
  const config = await getConfiguration();
  return await client.get<Array<HakutoiveenTulos>>(
    `${config.routes.valintatulos}/hakemus/${hakemusOid}/haku/${hakuOid}`,
  );
}

export async function getValintaTulokset(
  hakemusOid: string,
  hakuOid: string,
): Promise<Array<HakutoiveenTulos>> {
  const response = await fetchValintaTulokset(hakemusOid, hakuOid);
  return response.data;
}
