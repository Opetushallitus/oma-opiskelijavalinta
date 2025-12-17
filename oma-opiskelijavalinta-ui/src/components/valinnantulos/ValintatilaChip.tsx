import { useTranslations } from '@/hooks/useTranslations';
import { isNullish, mapKeys } from 'remeda';
import {
  type BadgeColor,
  BadgeColorKey,
  StatusBadgeChip,
} from '@/components/StatusBadgeChip';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';

const valintatilaStyles: Record<
  Valintatila,
  { label: string; color: BadgeColor }
> = {
  [Valintatila.HYVAKSYTTY]: {
    label: 'tulos.hyvaksytty',
    color: BadgeColorKey.Green,
  },
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: {
    label: 'tulos.hyvaksytty',
    color: BadgeColorKey.Green,
  },
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: {
    label: 'tulos.hyvaksytty',
    color: BadgeColorKey.Green,
  },

  [Valintatila.VARALLA]: {
    label: 'tulos.varalla',
    color: BadgeColorKey.Blue,
  },

  [Valintatila.HYLATTY]: {
    label: 'tulos.hylatty',
    color: BadgeColorKey.Red,
  },

  [Valintatila.KESKEN]: {
    label: 'tulos.kesken',
    color: BadgeColorKey.Yellow,
  },

  [Valintatila.PERUUTETTU]: {
    label: 'tulos.peruutettu',
    color: BadgeColorKey.Grey,
  },
  [Valintatila.PERUNUT]: {
    label: 'tulos.perunut',
    color: BadgeColorKey.Grey,
  },
  [Valintatila.PERUUNTUNUT]: {
    label: 'tulos.peruuntunut',
    color: BadgeColorKey.Grey,
  },
};

export function ValintatilaChip({
  hakutoiveenTulos,
  odottaaYlempaa,
  naytaKeskenTulos,
}: {
  hakutoiveenTulos?: HakutoiveenTulos;
  odottaaYlempaa?: boolean;
  naytaKeskenTulos: boolean;
}) {
  const { t, translateEntity } = useTranslations();
  if (isNullish(hakutoiveenTulos) && !naytaKeskenTulos) return null;
  if (
    (isNullish(hakutoiveenTulos) && naytaKeskenTulos) ||
    !hakutoiveenTulos?.julkaistavissa
  )
    return (
      <StatusBadgeChip
        badgeProps={{
          label: t('tulos.kesken'),
          color: BadgeColorKey.Yellow,
        }}
      />
    );
  const valintatila: Valintatila =
    (hakutoiveenTulos?.valintatila as Valintatila) || Valintatila.KESKEN;
  const style = valintatilaStyles[valintatila as Valintatila];
  let statusLabel = t(style.label);
  if (valintatila === Valintatila.VARALLA && hakutoiveenTulos?.varasijanumero) {
    statusLabel = t('tulos.varalla-varasija', {
      varasijanumero: String(hakutoiveenTulos?.varasijanumero),
    });
  } else if (valintatila === Valintatila.PERUUNTUNUT) {
    const tilanKuvaukset = hakutoiveenTulos?.tilanKuvaukset
      ? mapKeys(hakutoiveenTulos.tilanKuvaukset, (key) => key.toLowerCase())
      : undefined;
    statusLabel = `${statusLabel} - ${translateEntity(tilanKuvaukset)}`;
  } else if (valintatila === Valintatila.HYVAKSYTTY && odottaaYlempaa) {
    statusLabel = `${statusLabel} ${t('tulos.odottaa-ylempaa-hakutoivetta')}`;
  }
  return (
    <StatusBadgeChip
      badgeProps={{
        label: statusLabel,
        color: style.color,
      }}
    />
  );
}
