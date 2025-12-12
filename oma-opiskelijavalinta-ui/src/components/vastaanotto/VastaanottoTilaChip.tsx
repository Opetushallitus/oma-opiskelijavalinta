import { Chip } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { VastaanottoTila } from '@/lib/valinta-tulos-types';
import { greenBadgeBackground } from '@/lib/theme';

const vastaanottoTilaStyles: Record<
  VastaanottoTila,
  { label: string; background: string; color: string }
> = {
  [VastaanottoTila.VASTAANOTTANUT_SITOVASTI]: {
    label: 'vastaanotto.tila.vastaanotettu',
    background: greenBadgeBackground,
    color: ophColors.green1,
  },
  [VastaanottoTila.PERUNUT]: {
    label: 'vastaanotto.tila.peruttu',
    background: ophColors.grey400,
    color: ophColors.black,
  },
  //TODO nämä käydään läpi myöhemmissä taskeissa
  [VastaanottoTila.KESKEN]: {
    label: '',
    background: '',
    color: '',
  },
  [VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA]: {
    label: '',
    background: '',
    color: '',
  },
  [VastaanottoTila.PERUUTETTU]: {
    label: '',
    background: '',
    color: '',
  },
  [VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN]: {
    label: '',
    background: '',
    color: '',
  },
  [VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT]: {
    label: '',
    background: '',
    color: '',
  },
};

export function VastaanottoTilaChip({
  vastaanottoTila,
}: {
  vastaanottoTila: VastaanottoTila;
}) {
  const { t } = useTranslations();
  const style = vastaanottoTilaStyles[vastaanottoTila];
  const label = t(style.label);
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
