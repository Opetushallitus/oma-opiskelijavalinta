import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { HakutoiveName } from '../hakukohde/HakutoiveName';

export function IlmoittautuminenModalContent({
  hakutoive,
}: {
  hakutoive: Hakukohde;
}) {
  const { t } = useTranslations();

  return (
    <Box>
      <OphTypography>{t('ilmoittautuminen.modaali.info')}</OphTypography>
      <HakutoiveName hakutoive={hakutoive} />
    </Box>
  );
}
