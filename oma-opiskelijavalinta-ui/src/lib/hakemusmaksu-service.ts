import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';

type HakemusmaksunMaksupaivaResponse = {
  maksupaiva: string | null;
};

/**
 * Hakee hakemusmaksun maksupäivän (yyyy-MM-dd) maksut-palvelusta taustapalvelun kautta. Jos hakemusmaksu on
 * maksettu toisella hakemuksella, palautetaan sen hakemuksen maksupäivä.
 */
export async function getHakemusmaksunMaksupaiva(
  hakemusOid: string,
): Promise<string | null> {
  const config = await getConfiguration();
  const response = await client.get<HakemusmaksunMaksupaivaResponse>(
    `${config.routes.hakemusmaksu}/hakemus/${hakemusOid}/maksupaiva`,
  );
  return response.data.maksupaiva ?? null;
}
