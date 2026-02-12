import type { TranslatedName } from './localization/localization-types';

export type Haku = {
  oid: string;
  nimi: TranslatedName;
  hakuaikaKaynnissa: boolean;
  viimeisinPaattynytHakuAika: string;
  kohdejoukkoKoodiUri: string;
  hakutapaKoodiUri: string;
  koulutuksenAlkamiskausi?: 'kausi_k' | 'kausi_s' | null;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
  uudenOpiskelijanUrl: TranslatedName | null;
  yhdenPaikanSaanto: { voimassa: boolean };
};
