import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { AlertBox } from '@/components/AlertBox';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import { getEhdollisuusInfo } from '@/components/valinnantulos/ValintatilaInfo';

export function EhdollisuusAlert({ tulos }: { tulos: HakutoiveenTulos }) {
  const { getLanguage, t } = useTranslations();

  const info = getEhdollisuusInfo(tulos, getLanguage(), t, false);

  return (
    <AlertBox>
      <MultiInfoContainer
        data-test-id={`ehdollisuusinfo-${tulos.hakukohdeOid}`}
      >
        {info}
      </MultiInfoContainer>
    </AlertBox>
  );
}
