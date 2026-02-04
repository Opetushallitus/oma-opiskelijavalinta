import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import {
  Valintatila,
  type HakutoiveenTulos,
  type HakutoiveenTulosDto,
} from './valinta-tulos-types';

async function fetchValintaTulokset(hakemusOid: string, hakuOid: string) {
  const config = await getConfiguration();
  return await client.get<Array<HakutoiveenTulosDto>>(
    `${config.routes.valintatulos}/hakemus/${hakemusOid}/haku/${hakuOid}`,
  );
}

export async function getValintaTulokset(
  hakemusOid: string,
  hakuOid: string,
): Promise<Array<HakutoiveenTulos>> {
  const response = await fetchValintaTulokset(hakemusOid, hakuOid);
  const convertToTulos = (tulos: HakutoiveenTulosDto): HakutoiveenTulos => {
    return {
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
    };
  };
  return response.data.map(convertToTulos);
}
