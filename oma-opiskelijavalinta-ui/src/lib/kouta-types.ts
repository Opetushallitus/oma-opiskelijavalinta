import type { TranslatedName } from './localization/localization-types';

export type Haku = {
  oid: string;
  nimi: TranslatedName;
  hakuaikaKaynnissa: boolean;
  viimeisinPaattynytHakuAika: string;
  kohdejoukkoKoodiUri: string;
  hakutapaKoodiUri: string;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
  yhdenPaikanSaanto: { voimassa: boolean };
};
