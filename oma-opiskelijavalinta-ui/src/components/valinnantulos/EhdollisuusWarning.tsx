import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { WarningBox } from '@/components/WarningBox';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import { getEhdollisuusInfo } from '@/components/valinnantulos/ValintatilaInfo';

export function EhdollisuusWarning({ tulos }: { tulos: HakutoiveenTulos }) {
  const { getLanguage, t } = useTranslations();

  const info = getEhdollisuusInfo(tulos, getLanguage(), t, false);

  return (
    <WarningBox>
      <MultiInfoContainer
        data-test-id={`ehdollisuusinfo-${tulos.hakukohdeOid}`}
      >
        {info}
      </MultiInfoContainer>
    </WarningBox>
  );
}
