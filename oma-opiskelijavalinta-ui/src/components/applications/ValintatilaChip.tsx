import { Chip } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import {
  hylattyBackground,
  hyvaksyttyBackground,
  keskenBackground,
} from '@/lib/theme';

const valintatilaStyles: Record<
  Valintatila,
  { label: string; background: string; color: string }
> = {
  [Valintatila.HYVAKSYTTY]: {
    label: 'tulos.hyvaksytty',
    background: hyvaksyttyBackground,
    color: ophColors.green1,
  },
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: {
    label: 'tulos.hyvaksytty',
    background: hyvaksyttyBackground,
    color: ophColors.green1,
  },
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: {
    label: 'tulos.hyvaksytty',
    background: hyvaksyttyBackground,
    color: ophColors.green1,
  },

  [Valintatila.VARALLA]: {
    label: 'tulos.varalla',
    background: ophColors.lightBlue2,
    color: ophColors.cyan1,
  },

  [Valintatila.HYLATTY]: {
    label: 'tulos.hylatty',
    background: hylattyBackground,
    color: ophColors.grey900,
  },

  [Valintatila.KESKEN]: {
    label: 'tulos.kesken',
    background: keskenBackground,
    color: ophColors.orange1,
  },

  [Valintatila.PERUUTETTU]: {
    label: 'tulos.peruutettu',
    background: ophColors.grey300,
    color: ophColors.grey900,
  },
  [Valintatila.PERUNUT]: {
    label: 'tulos.perunut',
    background: ophColors.grey300,
    color: ophColors.grey900,
  },
  [Valintatila.PERUUNTUNUT]: {
    label: 'tulos.peruuntunut',
    background: ophColors.grey300,
    color: ophColors.grey900,
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
    <Chip
      label={label}
      sx={{
        backgroundColor: style.background,
        color: style.color,
        fontWeight: 'bold',
        borderRadius: '0px',
        mt: '0px',
      }}
    />
  );
}
