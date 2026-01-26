import type { Hakukohde } from '@/lib/kouta-types';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { isNullish } from 'remeda';

export const isJulkaistuHakutoiveenTulos = (
  tulokset: Array<HakutoiveenTulos>,
): boolean => {
  return tulokset.some((tulos) => tulos.julkaistavissa);
};

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
  const tulokset = hakemuksenTulokset.filter((t) => !isNullish(t));
  const higherResults = hakukohteet
    .slice(0, index)
    .map((hk) => tulokset.find((t) => t.hakukohdeOid === hk.oid));

  return higherResults.some(
    (ht) => ht?.valintatila === 'KESKEN' || ht?.valintatila === 'VARALLA',
  );
};

export function onkoKeskenTilaisiaValinnantiloja(
  hakemuksenTulokset: Array<HakutoiveenTulos>,
): boolean {
  return (
    hakemuksenTulokset.filter(
      (ht) => ht.valintatila && ht.valintatila === Valintatila.KESKEN,
    ).length > 0
  );
}
