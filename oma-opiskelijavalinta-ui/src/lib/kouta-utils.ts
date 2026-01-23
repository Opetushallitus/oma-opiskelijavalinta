import type { Haku } from './kouta-types';

export const isYhteishaku = (haku: Haku): boolean =>
  haku.hakutapaKoodiUri.startsWith('hakutapa_01');

export function isToisenAsteenYhteisHaku(haku: Haku): boolean {
  return (
    isYhteishaku(haku) &&
    haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_11')
  );
}

export function isKorkeakouluHaku(haku: Haku): boolean {
  return haku.kohdejoukkoKoodiUri.startsWith('haunkohdejoukko_12');
}

export function isJatkuvaTaiJoustavaHaku(haku: Haku): boolean {
  return (
    haku.hakutapaKoodiUri.startsWith('hakutapa_03') ||
    haku.hakutapaKoodiUri.startsWith('hakutapa_04')
  );
}
