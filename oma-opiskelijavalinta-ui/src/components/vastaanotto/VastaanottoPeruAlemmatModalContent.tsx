import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { HakutoiveName, HakutoiveList } from '../hakukohde/HakutoiveName';

export function VastaanottoPeruAiemmatModalContent({
  hakutoive,
  alemmatToiveet,
}: {
  hakutoive: Hakukohde;
  alemmatToiveet: Array<Hakukohde>;
}) {
  const { t } = useTranslations();

  return (
    <Box>
      <OphTypography>
        {t('vastaanotto.modaali.vastaanota-peru-alemmat.info')}
      </OphTypography>
      <HakutoiveName hakutoive={hakutoive} />
      <OphTypography>
        {t(
          alemmatToiveet.length > 1
            ? 'vastaanotto.modaali.vastaanota-peru-alemmat.info-alemmat-toiveet'
            : 'vastaanotto.modaali.vastaanota-peru-alemmat.info-alempi-toive',
        )}
      </OphTypography>
      {alemmatToiveet.length > 1 && <HakutoiveList toiveet={alemmatToiveet} />}
      {alemmatToiveet.length === 1 && alemmatToiveet[0] && (
        <HakutoiveName hakutoive={alemmatToiveet[0]} />
      )}
    </Box>
  );
}
