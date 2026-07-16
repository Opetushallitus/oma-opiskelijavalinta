import type { TranslatedName } from './localization/localization-types';

export type Haku = {
  oid: string;
  nimi: TranslatedName;
  hakuaikaKaynnissa: boolean;
  viimeisinPaattynytHakuAika?: number;
  kohdejoukkoKoodiUri: string;
  hakutapaKoodiUri: string;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
  uudenOpiskelijanUrl: TranslatedName | null;
  yhdenPaikanSaanto: { voimassa: boolean };
  koulutuksenAlkamiskausi?: 'kausi_k' | 'kausi_s' | null;
  koulutuksenAlkamisPvm: string | null;
};
