import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';

export function VastaanottoModalContent({
  hakutoive,
  modalParams,
}: {
  hakutoive: Hakukohde;
  modalParams: {
    info: string;
    title: string;
    confirmLabel: string;
    info2?: string;
  };
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <Box>
      <OphTypography>{t(modalParams.info)}</OphTypography>
      <OphTypography sx={{ fontWeight: 'bolder' }}>
        {translateEntity(hakutoive.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography sx={{ fontWeight: 'bolder' }}>
        {translateEntity(hakutoive.nimi)}
      </OphTypography>
      {modalParams.info2 && (
        <OphTypography>{t(modalParams.info2)}</OphTypography>
      )}
    </Box>
  );
}
