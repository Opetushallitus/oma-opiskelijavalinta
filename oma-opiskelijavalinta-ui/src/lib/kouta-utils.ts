import type { Haku } from './kouta-types';

export const isYhteishaku = (haku: Haku): boolean =>
  haku.hakutapaKoodiUri.startsWith('hakutapa_01');

export function isKorkeakouluHaku(haku: Haku): boolean {
  return haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_12');
}
