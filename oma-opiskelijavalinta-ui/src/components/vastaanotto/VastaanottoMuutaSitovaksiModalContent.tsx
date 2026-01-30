import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { HakutoiveName, HakutoiveList } from '../hakukohde/HakutoiveName';

export function VastaanottoMuutaSitovaksiModalContent({
  hakutoive,
  ylemmatToiveet,
}: {
  hakutoive: Hakukohde;
  ylemmatToiveet: Array<Hakukohde>;
}) {
  const { t } = useTranslations();

  return (
    <Box>
      <OphTypography>
        {t(
          ylemmatToiveet.length > 1
            ? 'vastaanotto.modaali.muuta-sitovaksi.info-ylemmat-toiveet'
            : 'vastaanotto.modaali.muuta-sitovaksi.info-ylempi-toive',
        )}
      </OphTypography>
      {ylemmatToiveet.length > 1 && <HakutoiveList toiveet={ylemmatToiveet} />}
      {ylemmatToiveet.length === 1 && ylemmatToiveet[0] && (
        <HakutoiveName hakutoive={ylemmatToiveet[0]} />
      )}
      <OphTypography>
        {t('vastaanotto.modaali.muuta-sitovaksi.info')}
      </OphTypography>
      <HakutoiveName hakutoive={hakutoive} />
    </Box>
  );
}
