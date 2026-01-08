import { useTranslations } from '@/hooks/useTranslations';
import { isNullish } from 'remeda';
import { BadgeColorKey, StatusBadgeChip } from '@/components/StatusBadgeChip';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import {
  getHakutoiveenTilaLabel,
  valintatilaColors,
} from '@/components/valinnantulos/tulos-display-utils';

export function ValintatilaChip({
  hakutoiveenTulos,
  odottaaYlempaa = false,
  naytaKeskenTulos = false,
}: {
  hakutoiveenTulos?: HakutoiveenTulos;
  odottaaYlempaa?: boolean;
  naytaKeskenTulos?: boolean;
}) {
  const { t } = useTranslations();
  if (isNullish(hakutoiveenTulos) && !naytaKeskenTulos) return null;
  if (
    (isNullish(hakutoiveenTulos) && naytaKeskenTulos) ||
    !hakutoiveenTulos?.julkaistavissa
  )
    return (
      <StatusBadgeChip
        badgeProps={{
          label: t('hakutoive.tila.kesken'),
          color: BadgeColorKey.Yellow,
        }}
      />
    );
  const valintatila: Valintatila =
    (hakutoiveenTulos?.valintatila as Valintatila) || Valintatila.KESKEN;
  const statusLabel = getHakutoiveenTilaLabel(hakutoiveenTulos, odottaaYlempaa);
  return (
    <StatusBadgeChip
      badgeProps={{
        label: statusLabel,
        color: valintatilaColors[valintatila as Valintatila],
      }}
    />
  );
}
