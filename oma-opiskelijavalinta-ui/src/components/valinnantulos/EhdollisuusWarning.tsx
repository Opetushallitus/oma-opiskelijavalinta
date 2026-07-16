import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { WarningBox } from '@/components/WarningBox';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import { getEhdollisuusInfo } from '@/components/valinnantulos/ValintatilaInfo';
import type { Hakemus } from '@/lib/hakemus-types';
import { PaatettavatOikeudetInfoVastaanotetulle } from '../vastaanotto/PaatettavatOikeudetInfo';
import { isDefined } from 'remeda';

export function EhdollisuusWarning({
  tulos,
  hakemus,
  naytaPaatettavatJosOn = false,
}: {
  tulos: HakutoiveenTulos;
  hakemus?: Hakemus;
  naytaPaatettavatJosOn?: boolean;
}) {
  const { getLanguage, t } = useTranslations();

  const info = getEhdollisuusInfo(tulos, getLanguage(), t, false);

  return (
    <WarningBox>
      <MultiInfoContainer
        data-test-id={`ehdollisuusinfo-${tulos.hakukohdeOid}`}
      >
        {info}
        {naytaPaatettavatJosOn && isDefined(hakemus) && (
          <PaatettavatOikeudetInfoVastaanotetulle
            hakemus={hakemus}
            tulokset={[tulos]}
          />
        )}
      </MultiInfoContainer>
    </WarningBox>
  );
}
