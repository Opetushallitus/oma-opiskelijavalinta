import type {Hakukohde} from "@/lib/kouta-types";
import type {HakutoiveenTulos} from "@/lib/valinta-tulos-types";

export const isHyvaksyttyOdottaaYlempaa = (
  hakukohteet: Array<Hakukohde>,
  hakemuksenTulokset: Array<HakutoiveenTulos>,
  tulos: HakutoiveenTulos,
  index: number,
): boolean => {
  const isHyvaksytty = tulos.valintatila === 'HYVAKSYTTY';
  const eiVastaanotettavissa =
    tulos.vastaanotettavuustila === 'EI_VASTAANOTETTAVISSA';
  if (!isHyvaksytty || !eiVastaanotettavissa) return false;

  const higherResults = hakukohteet
    .slice(0, index)
    .map((hk) => hakemuksenTulokset.find((t) => t.hakukohdeOid === hk.oid));

  return higherResults.some(
    (ht) => ht?.valintatila === 'KESKEN' || ht?.valintatila === 'VARALLA',
  );
};
