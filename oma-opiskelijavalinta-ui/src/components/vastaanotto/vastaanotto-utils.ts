import { VastaanottoTilaToiminto } from '@/lib/valinta-tulos-types';

export enum VastaanottoOption {
  PERU = 'PERU',
  VASTAANOTA_SITOVASTI = 'VASTAANOTA_SITOVASTI',
  VASTAANOTA_EHDOLLISESTI_KK = 'VASTAANOTA_EHDOLLISESTI_KK',
  VASTAANOTA_SITOVASTI_JONOTTAMATTA_KK = 'VASTAANOTA_SITOVASTI_JONOTTAMATTA_KK',
  VASTAANOTA_SITOVASTI_PERU_ALEMMAT = 'VASTAANOTA_SITOVASTI_PERU_ALEMMAT',
}

export const VastaanottoOptionToToiminto: Record<
  VastaanottoOption,
  VastaanottoTilaToiminto
> = {
  [VastaanottoOption.PERU]: VastaanottoTilaToiminto.PERU,
  [VastaanottoOption.VASTAANOTA_SITOVASTI]:
    VastaanottoTilaToiminto.VASTAANOTA_SITOVASTI,
  [VastaanottoOption.VASTAANOTA_SITOVASTI_JONOTTAMATTA_KK]:
    VastaanottoTilaToiminto.VASTAANOTA_SITOVASTI,
  [VastaanottoOption.VASTAANOTA_EHDOLLISESTI_KK]:
    VastaanottoTilaToiminto.VASTAANOTA_EHDOLLISESTI,
  [VastaanottoOption.VASTAANOTA_SITOVASTI_PERU_ALEMMAT]:
    VastaanottoTilaToiminto.VASTAANOTA_SITOVASTI_PERU_ALEMMAT,
} as const;

export const VastaanottoModalParams: Record<
  VastaanottoOption,
  {
    info: string;
    info2?: string;
    title: string;
    confirmLabel: string;
    successMessage: string;
  }
> = {
  [VastaanottoOption.PERU]: {
    title: 'vastaanotto.modaali.peru.otsikko',
    confirmLabel: 'vastaanotto.modaali.peru.vahvista',
    info: 'vastaanotto.modaali.peru.info',
    successMessage: 'vastaanotto.modaali.peru.onnistui',
  },
  [VastaanottoOption.VASTAANOTA_SITOVASTI]: {
    title: 'vastaanotto.modaali.vastaanota-sitovasti.otsikko',
    confirmLabel: 'vastaanotto.modaali.vastaanota-sitovasti.vahvista',
    info: 'vastaanotto.modaali.vastaanota-sitovasti.info',
    successMessage: 'vastaanotto.modaali.vastaanota-sitovasti.onnistui',
  },
  [VastaanottoOption.VASTAANOTA_SITOVASTI_JONOTTAMATTA_KK]: {
    title: 'vastaanotto.modaali.vastaanota-sitovasti-jonottamatta-kk.otsikko',
    confirmLabel:
      'vastaanotto.modaali.vastaanota-sitovasti-jonottamatta-kk.vahvista',
    info: 'vastaanotto.modaali.vastaanota-sitovasti-jonottamatta-kk.info',
    info2: 'vastaanotto.modaali.vastaanota-sitovasti-jonottamatta-kk.info2',
    successMessage:
      'vastaanotto.modaali.vastaanota-sitovasti-jonottamatta-kk.onnistui',
  },
  [VastaanottoOption.VASTAANOTA_EHDOLLISESTI_KK]: {
    title: 'vastaanotto.modaali.vastaanota-ehdollisesti-kk.otsikko',
    confirmLabel: 'vastaanotto.modaali.vastaanota-ehdollisesti-kk.vahvista',
    info: 'vastaanotto.modaali.vastaanota-ehdollisesti-kk.info',
    info2: 'vastaanotto.modaali.vastaanota-ehdollisesti-kk.info2',
    successMessage: 'vastaanotto.modaali.vastaanota-ehdollisesti-kk.onnistui',
  },
  //TODO: tämä taitaa liittyä vain toisen asteen yhteishakuun, toteutus myöhemmin
  [VastaanottoOption.VASTAANOTA_SITOVASTI_PERU_ALEMMAT]: {
    title: '',
    confirmLabel: '',
    info: '',
    successMessage: '',
  },
} as const;
