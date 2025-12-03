import { useTranslations } from '@/hooks/useTranslations';
import {
  type BadgeColor,
  BadgeColorKey,
  StatusBadgeChip,
} from '@/components/applications/StatusBadgeChip';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import {
  hylattyBackground,
  hyvaksyttyBackground,
  keskenBackground,
} from '@/lib/theme';

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
}: {
  hakutoiveenTulos?: HakutoiveenTulos;
}) {
  const { t } = useTranslations();
  const valintatila: Valintatila =
    (hakutoiveenTulos?.valintatila as Valintatila) || Valintatila.KESKEN;
  const style = valintatilaStyles[valintatila as Valintatila];
  const label =
    valintatila === Valintatila.VARALLA && hakutoiveenTulos?.varasijanumero
      ? t('tulos.varalla-varasija', {
          varasijanumero: String(hakutoiveenTulos?.varasijanumero),
        })
      : t(style.label);
  return (
    <StatusBadgeChip
      badgeProps={{
        label: label,
        color: style.color,
      }}
    />
  );
}
