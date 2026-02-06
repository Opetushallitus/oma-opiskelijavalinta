import { isTruthy } from 'remeda';
import type { Haku } from './kouta-types';

const HAKUTAPA_YHTEISHAKU = 'hakutapa_01';
const HAKUTAPA_JATKUVA = 'hakutapa_03';
const HAKUTAPA_JOUSTAVA = 'hakutapa_04';

const HAUN_KOHDEJOUKKO_PERUSOPETUKSEN_JALKEISEN_KOULUTUKSEN_YHTEISHAKU =
  'haunkohdejoukko_11';
const HAUN_KOHDEJOUKKO_KORKEAKOULUTUS = 'haunkohdejoukko_12';

export const isYhteishaku = (haku: Haku): boolean =>
  haku.hakutapaKoodiUri.startsWith(HAKUTAPA_YHTEISHAKU);

export function isToisenAsteenYhteisHaku(haku?: Haku | null): boolean {
  return (
    isTruthy(haku) &&
    isYhteishaku(haku) &&
    haku.kohdejoukkoKoodiUri.startsWith(
      HAUN_KOHDEJOUKKO_PERUSOPETUKSEN_JALKEISEN_KOULUTUKSEN_YHTEISHAKU,
    )
  );
}

export function isKorkeakouluHaku(haku?: Haku | null): boolean {
  return (
    isTruthy(haku) &&
    haku.kohdejoukkoKoodiUri.startsWith(HAUN_KOHDEJOUKKO_KORKEAKOULUTUS)
  );
}

export function isJatkuvaTaiJoustavaHaku(haku?: Haku): boolean {
  return (
    isTruthy(haku) &&
    (haku.hakutapaKoodiUri.startsWith(HAKUTAPA_JATKUVA) ||
      haku.hakutapaKoodiUri.startsWith(HAKUTAPA_JOUSTAVA))
  );
}

export function isKevatAlkamiskausi(haku?: Haku | null): boolean {
  return isTruthy(haku) && haku.koulutuksenAlkamiskausi === 'kausi_k';
}
