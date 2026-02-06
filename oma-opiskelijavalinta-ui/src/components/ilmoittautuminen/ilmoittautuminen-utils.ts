import type { Ilmoittautuminen } from '@/lib/valinta-tulos-types';
import { isTruthy } from 'remeda';

const OILI_ILMOITTAUTUMISTAPA = 'Oili';

export function isOili(ilmoittautuminen?: Ilmoittautuminen): boolean {
  return (
    isTruthy(ilmoittautuminen) &&
    isTruthy(ilmoittautuminen.ilmoittautumistapa) &&
    ilmoittautuminen.ilmoittautumistapa.nimi.fi === OILI_ILMOITTAUTUMISTAPA
  );
}
