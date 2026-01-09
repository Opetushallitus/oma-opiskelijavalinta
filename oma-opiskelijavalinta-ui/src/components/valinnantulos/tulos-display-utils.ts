import {
  type HakutoiveenTulos,
  type JonokohtainenTulostieto,
  Valintatila,
} from '@/lib/valinta-tulos-types';
import { type BadgeColor, BadgeColorKey } from '@/components/StatusBadgeChip';
import { mapKeys } from 'remeda';
import { useTranslations } from '@/hooks/useTranslations';

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

export const valintatilaIlmanJonoaLabels: Record<Valintatila, string> = {
  [Valintatila.HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.VARALLA]: 'tulos.varalla',
  [Valintatila.HYLATTY]: 'tulos.hylatty',
  [Valintatila.KESKEN]: 'tulos.kesken',
  [Valintatila.PERUUTETTU]: 'tulos.peruutettu',
  [Valintatila.PERUNUT]: 'tulos.perunut',
  [Valintatila.PERUUNTUNUT]: 'tulos.peruuntunut',
};

export const ValintatapajononTilaLabels: Record<Valintatila, string> = {
  [Valintatila.HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.VARALLA]: 'tulos.varalla',
  [Valintatila.HYLATTY]: 'tulos.valintatapajono.hylatty',
  [Valintatila.KESKEN]: 'tulos.kesken',
  [Valintatila.PERUUTETTU]: 'tulos.peruutettu',
  [Valintatila.PERUNUT]: 'tulos.perunut',
  [Valintatila.PERUUNTUNUT]: 'tulos.peruuntunut',
};

const hakutoiveenTilaLabels: Record<Valintatila, string> = {
  [Valintatila.HYVAKSYTTY]: 'hakutoive.tila.hyvaksytty',
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: 'hakutoive.tila.hyvaksytty',
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: 'hakutoive.tila.hyvaksytty',
  [Valintatila.VARALLA]: 'hakutoive.tila.varalla',
  [Valintatila.HYLATTY]: 'hakutoive.tila.hylatty',
  [Valintatila.KESKEN]: 'hakutoive.tila.kesken',
  [Valintatila.PERUUTETTU]: 'hakutoive.tila.peruutettu',
  [Valintatila.PERUNUT]: 'hakutoive.tila.perunut',
  [Valintatila.PERUUNTUNUT]: 'hakutoive.tila.peruuntunut',
};

export function getHakutoiveenTilaLabel(
  hakutoiveenTulos: HakutoiveenTulos,
  odottaaYlempaa: boolean,
): string {
  const { t, translateEntity } = useTranslations();
  const hakutoiveenTilaLabel = t(
    hakutoiveenTilaLabels[hakutoiveenTulos.valintatila as Valintatila],
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
  return t(
    valintatilaIlmanJonoaLabels[hakutoiveenTulos.valintatila as Valintatila],
  );
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
  return t(ValintatapajononTilaLabels[jonoTulos.valintatila as Valintatila]);
}

export function isHyvaksyttyTaiVaralla(valintatila: Valintatila): boolean {
  return (
    valintatila === Valintatila.HYVAKSYTTY ||
    valintatila === Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY ||
    valintatila === Valintatila.VARASIJALTA_HYVAKSYTTY ||
    valintatila === Valintatila.VARALLA
  );
}
