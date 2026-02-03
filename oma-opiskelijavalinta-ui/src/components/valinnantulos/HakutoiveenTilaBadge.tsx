import {
  type HakutoiveenTulos,
  Valintatila,
  VastaanottoTila,
} from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { isNullish } from 'remeda';
import { BadgeColorKey, StatusBadgeChip } from '@/components/StatusBadgeChip';
import {
  getHakutoiveenTilaLabel,
  valintatilaColors,
} from '@/components/valinnantulos/valinnan-tulos-utils';
import { VastaanottoTilaChip } from '@/components/vastaanotto/VastaanottoTilaChip';

export function HakutoiveenTilaBadge({
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
  const vastaanottotila: VastaanottoTila =
    hakutoiveenTulos?.vastaanottotila || VastaanottoTila.KESKEN;
  const valintatila: Valintatila =
    hakutoiveenTulos?.valintatila || Valintatila.KESKEN;
  const statusLabel = getHakutoiveenTilaLabel(hakutoiveenTulos, odottaaYlempaa);
  // jos ehdollisesti hyväksytty ja vastaanottanut, näytetään kaikki badget
  if (
    vastaanottotila === VastaanottoTila.VASTAANOTTANUT_SITOVASTI &&
    hakutoiveenTulos?.valintatila === Valintatila.HYVAKSYTTY &&
    hakutoiveenTulos.ehdollisestiHyvaksyttavissa
  ) {
    return (
      <>
        <StatusBadgeChip
          badgeProps={{
            label: statusLabel,
            color: valintatilaColors[valintatila],
          }}
        />
        <StatusBadgeChip
          sx={{ ml: 1 }}
          badgeProps={{
            label: t('hakutoive.tila.ehdollisesti-hyvaksytty'),
            color: BadgeColorKey.Yellow,
          }}
        />
        <VastaanottoTilaChip vastaanottoTila={vastaanottotila} />
      </>
    );
  }
  // jos on vastaanottotieto, näytetään se
  if (vastaanottotila !== VastaanottoTila.KESKEN) {
    return <VastaanottoTilaChip vastaanottoTila={vastaanottotila} />;
  }
  // muuten valintatila-badge
  return (
    <>
      <StatusBadgeChip
        badgeProps={{
          label: statusLabel,
          color: valintatilaColors[valintatila],
        }}
      />
      {hakutoiveenTulos?.ehdollisestiHyvaksyttavissa && (
        <StatusBadgeChip
          sx={{ ml: 1 }}
          badgeProps={{
            label: t('hakutoive.tila.ehdollisesti-hyvaksytty'),
            color: BadgeColorKey.Yellow,
          }}
        />
      )}
    </>
  );
}
