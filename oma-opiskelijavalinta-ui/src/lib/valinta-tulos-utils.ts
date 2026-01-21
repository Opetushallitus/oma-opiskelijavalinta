import type { Hakukohde } from '@/lib/kouta-types';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';

export function onkoJulkaisemattomiaValinnantiloja(
  hakemuksenTulokset: Array<HakutoiveenTulos>,
  hakutoiveet: Array<Hakukohde>,
): boolean {
  return (
    hakutoiveet.length > hakemuksenTulokset.length ||
    hakemuksenTulokset.filter(
      (ht) =>
        ht.valintatila &&
        (ht.valintatila === Valintatila.KESKEN || !ht.julkaistavissa),
    ).length > 0
  );
}
