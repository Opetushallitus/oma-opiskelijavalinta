import {
  type HakutoiveenTulos,
  type JonokohtainenTulostieto,
  Valintatila,
} from '@/lib/valinta-tulos-types';
import { type BadgeColor, BadgeColorKey } from '@/components/StatusBadgeChip';
import { isDefined, isNonNullish, mapKeys, mapValues } from 'remeda';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import type { Hakemus } from '@/lib/hakemus-types';

export type ValintatilaLabel = {
  hakutoiveLabel: string;
  ilmanJonoaLabel: string;
  valintatapajonoLabel: string;
};

const ValintatilaLabels: Record<Valintatila, ValintatilaLabel> = {
  [Valintatila.HYVAKSYTTY]: {
    hakutoiveLabel: 'hakutoive.tila.hyvaksytty',
    ilmanJonoaLabel: 'tulos.hyvaksytty',
    valintatapajonoLabel: 'tulos.hyvaksytty',
  },
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: {
    hakutoiveLabel: 'hakutoive.tila.hyvaksytty',
    ilmanJonoaLabel: 'tulos.hyvaksytty',
    valintatapajonoLabel: 'tulos.hyvaksytty',
  },
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: {
    hakutoiveLabel: 'hakutoive.tila.hyvaksytty',
    ilmanJonoaLabel: 'tulos.hyvaksytty',
    valintatapajonoLabel: 'tulos.hyvaksytty',
  },
  [Valintatila.VARALLA]: {
    hakutoiveLabel: 'hakutoive.tila.varalla',
    ilmanJonoaLabel: 'tulos.varalla',
    valintatapajonoLabel: 'tulos.varalla',
  },
  [Valintatila.HYLATTY]: {
    hakutoiveLabel: 'hakutoive.tila.hylatty',
    ilmanJonoaLabel: 'tulos.hylatty',
    valintatapajonoLabel: 'tulos.valintatapajono.hylatty',
  },
  [Valintatila.KESKEN]: {
    hakutoiveLabel: 'hakutoive.tila.kesken',
    ilmanJonoaLabel: 'tulos.kesken',
    valintatapajonoLabel: 'tulos.kesken',
  },
  [Valintatila.PERUUTETTU]: {
    hakutoiveLabel: 'hakutoive.tila.peruutettu',
    ilmanJonoaLabel: 'tulos.peruutettu',
    valintatapajonoLabel: 'tulos.peruutettu',
  },
  [Valintatila.PERUNUT]: {
    hakutoiveLabel: 'hakutoive.tila.perunut',
    ilmanJonoaLabel: 'tulos.perunut',
    valintatapajonoLabel: 'tulos.perunut',
  },
  [Valintatila.PERUUNTUNUT]: {
    hakutoiveLabel: 'hakutoive.tila.peruuntunut',
    ilmanJonoaLabel: 'tulos.peruuntunut',
    valintatapajonoLabel: 'tulos.peruuntunut',
  },
};

export const valintatilaColors: Record<Valintatila, BadgeColor> = {
  [Valintatila.HYVAKSYTTY]: BadgeColorKey.Green,
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: BadgeColorKey.Green,
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: BadgeColorKey.Green,
  [Valintatila.VARALLA]: BadgeColorKey.Blue,
  [Valintatila.HYLATTY]: BadgeColorKey.Red,
  [Valintatila.KESKEN]: BadgeColorKey.Yellow,
  [Valintatila.PERUUTETTU]: BadgeColorKey.Grey,
  [Valintatila.PERUNUT]: BadgeColorKey.Grey,
  [Valintatila.PERUUNTUNUT]: BadgeColorKey.Grey,
};

const hakutoiveenTilaLabels = mapValues(
  ValintatilaLabels,
  (label) => label.hakutoiveLabel,
);

export const valintatilaIlmanJonoaLabels = mapValues(
  ValintatilaLabels,
  (label) => label.ilmanJonoaLabel,
);

export const ValintatapajononTilaLabels = mapValues(
  ValintatilaLabels,
  (label) => label.valintatapajonoLabel,
);

export function getHakutoiveenTilaLabel(
  hakutoiveenTulos: HakutoiveenTulos,
  odottaaYlempaa: boolean,
): string {
  const { t, translateEntity } = useTranslations();
  const hakutoiveenTilaLabel = t(
    hakutoiveenTilaLabels[hakutoiveenTulos.valintatila],
  );
  if (
    hakutoiveenTulos.valintatila === Valintatila.VARALLA &&
    hakutoiveenTulos?.varasijanumero
  ) {
    return t('hakutoive.tila.varalla-varasija', {
      varasijanumero: String(hakutoiveenTulos?.varasijanumero),
    });
  } else if (hakutoiveenTulos.valintatila === Valintatila.PERUUNTUNUT) {
    const tilanKuvaukset = hakutoiveenTulos?.tilanKuvaukset
      ? mapKeys(hakutoiveenTulos.tilanKuvaukset, (key) => key.toLowerCase())
      : undefined;
    return `${hakutoiveenTilaLabel} - ${translateEntity(tilanKuvaukset)}`;
  } else if (
    hakutoiveenTulos.valintatila === Valintatila.HYVAKSYTTY &&
    odottaaYlempaa
  ) {
    return `${hakutoiveenTilaLabel} ${t('hakutoive.tila.odottaa-ylempaa-hakutoivetta')}`;
  }
  return hakutoiveenTilaLabel;
}

export function getValintatilaIlmanSijoitteluaLabel(
  hakutoiveenTulos: HakutoiveenTulos,
): string {
  const { t } = useTranslations();
  if (
    hakutoiveenTulos.valintatila === Valintatila.VARALLA &&
    hakutoiveenTulos?.varasijanumero
  ) {
    return t('tulos.varalla-varasija', {
      varasijanumero: String(hakutoiveenTulos?.varasijanumero),
    });
  }
  return t(valintatilaIlmanJonoaLabels[hakutoiveenTulos.valintatila]);
}

export function getValintatapajononTilaLabel(
  jonoTulos: JonokohtainenTulostieto,
): string {
  const { t } = useTranslations();
  if (
    jonoTulos.valintatila === Valintatila.VARALLA &&
    jonoTulos?.varasijanumero
  ) {
    return t('tulos.varalla-varasija', {
      varasijanumero: String(jonoTulos?.varasijanumero),
    });
  }
  return t(ValintatapajononTilaLabels[jonoTulos.valintatila]);
}

const hyvaksyttyTaiVarallaTilat = new Set<Valintatila>([
  Valintatila.HYVAKSYTTY,
  Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY,
  Valintatila.VARASIJALTA_HYVAKSYTTY,
  Valintatila.VARALLA,
]);

const hyvaksyttyTilat = new Set<Valintatila>([
  Valintatila.HYVAKSYTTY,
  Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY,
  Valintatila.VARASIJALTA_HYVAKSYTTY,
]);

export const isHyvaksyttyTaiVaralla = (t: Valintatila) =>
  hyvaksyttyTaiVarallaTilat.has(t);

export const isHyvaksytty = (t: Valintatila) => hyvaksyttyTilat.has(t);

export const isJulkaistuHakutoiveenTulos = (
  tulokset: Array<HakutoiveenTulos>,
): boolean => {
  return tulokset.some((tulos) => tulos.julkaistavissa);
};

export function getYlemmatHakutoiveet(
  application: Hakemus,
  hakukohdeOid: string,
): Array<Hakukohde> {
  const hakukohteet = application.hakukohteet ?? [];

  const index = hakukohteet.findIndex((hk) => hk.oid === hakukohdeOid);

  if (index <= 0) {
    return [];
  }

  return hakukohteet.slice(0, index);
}

export function getAlemmatHyvaksytyt(
  hakukohdeOid: string,
  application: Hakemus,
) {
  const index = application.hakukohteet?.findIndex(
    (hk) => hk.oid === hakukohdeOid,
  );
  if (isDefined(index)) {
    const alemmatHyvaksytyt = application.hakukohteet?.slice(index + 1) ?? [];
    return alemmatHyvaksytyt?.filter((hk) =>
      application.hakemuksenTulokset.find(
        (t) => t.hakukohdeOid === hk.oid && hyvaksyttyTilat.has(t.valintatila),
      ),
    );
  }
  return [];
}

export function hasAlempiHyvaksytty(
  hakukohdeOid: string,
  application: Hakemus,
) {
  return getAlemmatHyvaksytyt(hakukohdeOid, application).length > 0;
}

export const isHyvaksyttyOdottaaYlempaa = (
  application: Hakemus,
  tulos: HakutoiveenTulos,
): boolean => {
  if (
    !hyvaksyttyTilat.has(tulos.valintatila) ||
    tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA'
  ) {
    return false;
  }

  const ylemmatHakutoiveet = getYlemmatHakutoiveet(
    application,
    tulos.hakukohdeOid,
  );

  if (ylemmatHakutoiveet.length === 0) {
    return false;
  }
  return ylemmatHakutoiveet.some((hk) => {
    const ylempiTulos = application.hakemuksenTulokset.find(
      (ht) => ht.hakukohdeOid === hk.oid,
    );

    return (
      !ylempiTulos ||
      ylempiTulos.valintatila === Valintatila.KESKEN ||
      ylempiTulos.valintatila === Valintatila.VARALLA
    );
  });
};

export function getVarallaOlevatMuutToiveet(
  application: Hakemus,
  hakukohdeOid: string,
): Array<Hakukohde> {
  const varallaOlevat = application.hakemuksenTulokset.filter(
    (ht) =>
      ht.valintatila === Valintatila.VARALLA &&
      ht.hakukohdeOid !== hakukohdeOid,
  );
  return varallaOlevat
    .map((ht) =>
      application.hakukohteet?.find((hk) => hk.oid === ht.hakukohdeOid),
    )
    .filter(isNonNullish);
}
