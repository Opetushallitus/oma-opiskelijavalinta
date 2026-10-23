import type { TranslatedName } from './localization/localization-types';

export type Haku = {
  oid: string;
  nimi: TranslatedName;
  hakuaikaKaynnissa: boolean;
  viimeisinPaattynytHakuAika?: number;
  kohdejoukkoKoodiUri: string;
  hakutapaKoodiUri: string;
  alkamiskausi?: 'kausi_k' | 'kausi_s';
  alkamisvuosi?: string;
};

export type Hakukohde = {
  oid: string;
  nimi: TranslatedName;
  jarjestyspaikkaHierarkiaNimi: TranslatedName;
  uudenOpiskelijanUrl: TranslatedName | null;
  yhdenPaikanSaanto: { voimassa: boolean };
  koulutuksenAlkamiskausi?: 'kausi_k' | 'kausi_s';
  koulutuksenAlkamisPvm: string | null;
};
