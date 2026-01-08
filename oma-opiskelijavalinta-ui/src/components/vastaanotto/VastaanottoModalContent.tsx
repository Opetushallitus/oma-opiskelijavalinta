import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { T } from '@tolgee/react';
import { styled } from '@/lib/theme';

const ModalBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1.5),
}));

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
    <ModalBox>
      <OphTypography>{t(modalParams.info)}</OphTypography>
      <Box>
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {translateEntity(hakutoive.jarjestyspaikkaHierarkiaNimi)}
        </OphTypography>
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {translateEntity(hakutoive.nimi)}
        </OphTypography>
      </Box>
      {modalParams.info2 && (
        <OphTypography>
          <T
            keyName={modalParams.info2}
            params={{
              br: <br />,
            }}
          ></T>
        </OphTypography>
      )}
    </ModalBox>
  );
}
