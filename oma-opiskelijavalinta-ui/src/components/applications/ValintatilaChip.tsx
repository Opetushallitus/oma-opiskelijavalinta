import { Chip } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { HakutoiveenTulos } from '@/lib/application.service';

export const VALINTATILA = {
  HYVAKSYTTY: 'HYVAKSYTTY',
  HARKINNANVARAISESTI_HYVAKSYTTY: 'HARKINNANVARAISESTI_HYVAKSYTTY',
  VARASIJALTA_HYVAKSYTTY: 'VARASIJALTA_HYVAKSYTTY',
  VARALLA: 'VARALLA',
  PERUUTETTU: 'PERUUTETTU',
  PERUNUT: 'PERUNUT',
  PERUUNTUNUT: 'PERUUNTUNUT',
  HYLATTY: 'HYLATTY',
  KESKEN: 'KESKEN',
} as const;

type Valintatila = keyof typeof VALINTATILA;

const hyvaksyttyBackground = '#E2FAE4';
const hylattyBackground = '#EECFC5';
const keskenBackground = '#FAE6A8';

const valintatilaStyles: Record<
  Valintatila,
  { label: string; background: string; color: string }
> = {
  HYVAKSYTTY: {
    label: 'tulos.hyvaksytty',
    background: hyvaksyttyBackground,
    color: ophColors.green1,
  },
  HARKINNANVARAISESTI_HYVAKSYTTY: {
    label: 'tulos.hyvaksytty',
    background: hyvaksyttyBackground,
    color: ophColors.green1,
  },
  VARASIJALTA_HYVAKSYTTY: {
    label: 'tulos.hyvaksytty',
    background: hyvaksyttyBackground,
    color: ophColors.green1,
  },

  VARALLA: {
    label: 'tulos.varalla',
    background: ophColors.lightBlue2,
    color: ophColors.cyan1,
  },

  HYLATTY: {
    label: 'tulos.hylatty',
    background: hylattyBackground,
    color: ophColors.grey900,
  },

  KESKEN: {
    label: 'tulos.kesken',
    background: keskenBackground,
    color: ophColors.orange1,
  },

  PERUUTETTU: {
    label: 'tulos.peruutettu',
    background: ophColors.grey300,
    color: ophColors.grey900,
  },
  PERUNUT: {
    label: 'tulos.perunut',
    background: ophColors.grey300,
    color: ophColors.grey900,
  },
  PERUUNTUNUT: {
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
    (hakutoiveenTulos?.valintatila as Valintatila) || 'KESKEN';
  console.log(
    'hakutoiveenTulos.varasijanumero',
    hakutoiveenTulos?.varasijanumero,
  );
  console.log('valintatila', valintatila);
  const style = valintatilaStyles[valintatila as Valintatila];
  console.log();
  const label =
    valintatila === 'VARALLA' && hakutoiveenTulos?.varasijanumero
      ? t('tulos.varalla-varasija', {
          varasijanumero: String(hakutoiveenTulos?.varasijanumero),
        })
      : t(style.label);
  console.log('label', label);
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
