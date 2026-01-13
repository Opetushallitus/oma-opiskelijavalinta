import { useTranslations } from '@/hooks/useTranslations';
import { VastaanottoTila } from '@/lib/valinta-tulos-types';
import {
  type BadgeColor,
  BadgeColorKey,
  StatusBadgeChip,
} from '@/components/StatusBadgeChip';

const vastaanottoTilaStyles: Record<
  VastaanottoTila,
  { label: string; color: BadgeColor }
> = {
  [VastaanottoTila.VASTAANOTTANUT_SITOVASTI]: {
    label: 'vastaanotto.tila.vastaanotettu',
    color: BadgeColorKey.Green,
  },
  [VastaanottoTila.PERUNUT]: {
    label: 'vastaanotto.tila.peruttu',
    color: BadgeColorKey.Grey,
  },
  //TODO nämä käydään läpi myöhemmissä taskeissa
  [VastaanottoTila.KESKEN]: {
    label: '',
    color: BadgeColorKey.Yellow,
  },
  [VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA]: {
    label: 'vastaanotto.tila.ei-vastaanotettu-maara-aikana',
    color: BadgeColorKey.Grey,
  },
  [VastaanottoTila.PERUUTETTU]: {
    label: '',
    color: BadgeColorKey.Grey,
  },
  [VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN]: {
    label: '',
    color: BadgeColorKey.Grey,
  },
  [VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT]: {
    label: 'vastaanotto.tila.vastaanotettu-ehdollisesti',
    color: BadgeColorKey.Grey,
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
    <StatusBadgeChip
      badgeProps={{
        label: label,
        color: style.color,
      }}
    />
  );
}
