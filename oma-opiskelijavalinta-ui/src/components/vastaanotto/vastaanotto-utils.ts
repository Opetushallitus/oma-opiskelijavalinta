import type { Hakemus } from '@/lib/hakemus-types';
import type { Hakukohde } from '@/lib/kouta-types';
import {
  Valintatila,
  VastaanottoTila,
  VastaanottoTilaToiminto,
} from '@/lib/valinta-tulos-types';
import { isDefined, isNonNullish } from 'remeda';

export enum VastaanottoOption {
  PERU = 'PERU',
  VASTAANOTA_SITOVASTI = 'VASTAANOTA_SITOVASTI',
  VASTAANOTA_SITOVASTI_KK = 'VASTAANOTA_SITOVASTI_KK',
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
  [VastaanottoOption.VASTAANOTA_SITOVASTI_KK]:
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
    useVastaanottoPeruAiemmatModal?: boolean;
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
  [VastaanottoOption.VASTAANOTA_SITOVASTI_KK]: {
    title: 'vastaanotto.modaali.vastaanota-sitovasti-kk.otsikko',
    confirmLabel: 'vastaanotto.modaali.vastaanota-sitovasti-kk.vahvista',
    info: 'vastaanotto.modaali.vastaanota-sitovasti-kk.info',
    info2: 'vastaanotto.modaali.vastaanota-sitovasti-kk.info2',
    successMessage: 'vastaanotto.modaali.vastaanota-sitovasti-kk.onnistui',
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
  [VastaanottoOption.VASTAANOTA_SITOVASTI_PERU_ALEMMAT]: {
    title: 'vastaanotto.modaali.vastaanota-peru-alemmat.otsikko',
    confirmLabel: 'vastaanotto.modaali.vastaanota-peru-alemmat.vahvista',
    info: 'vastaanotto.modaali.vastaanota-peru-alemmat.info',
    successMessage: 'vastaanotto.modaali.vastaanota-peru-alemmat.onnistui',
    useVastaanottoPeruAiemmatModal: true,
  },
} as const;

export function getVarallaOlevatYlemmatToiveet(
  application: Hakemus,
  hakutoive: Hakukohde,
): Array<Hakukohde> {
  const indexOfHakutoive = application.hakemuksenTulokset.findIndex(
    (ht) => ht.hakukohdeOid === hakutoive.oid,
  );
  const varallaOlevat = application.hakemuksenTulokset
    .slice(0, indexOfHakutoive)
    .filter((ht) => ht.valintatila === Valintatila.VARALLA);
  return varallaOlevat
    .map((ht) =>
      application.hakukohteet?.find((hk) => hk.oid === ht.hakukohdeOid),
    )
    .filter(isNonNullish);
}

export function getAlemmatVastaanotot(
  hakutoive: Hakukohde,
  application: Hakemus,
) {
  const index = application.hakukohteet?.findIndex(
    (hk) => hk.oid === hakutoive.oid,
  );
  if (isDefined(index)) {
    const alemmatToiveet = application.hakukohteet?.slice(index + 1) ?? [];
    return alemmatToiveet?.filter((hk) =>
      application.hakemuksenTulokset.find(
        (t) =>
          t.hakukohdeOid === hk.oid &&
          t.vastaanottotila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      ),
    );
  }
  return [];
}

export function hasAlemmatVastaanotot(
  hakutoive: Hakukohde,
  application: Hakemus,
) {
  return getAlemmatVastaanotot(hakutoive, application).length > 0;
}
