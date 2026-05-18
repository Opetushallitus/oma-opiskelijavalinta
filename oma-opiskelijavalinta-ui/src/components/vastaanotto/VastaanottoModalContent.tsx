import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakukohde } from '@/lib/kouta-types';
import { styled } from '@/lib/theme';
import { HakutoiveName } from '../hakukohde/HakutoiveName';

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
    yps?: string;
  };
}) {
  const { t } = useTranslations();
  const YPS = hakutoive.yhdenPaikanSaanto?.voimassa;
  return (
    <ModalBox>
      <OphTypography>{t(modalParams.info)}</OphTypography>
      <HakutoiveName hakutoive={hakutoive} />
      {modalParams.info2 && (
        <OphTypography>{t(modalParams.info2)}</OphTypography>
      )}
      {YPS && modalParams.yps && (
        <OphTypography>{t(modalParams.yps)}</OphTypography>
      )}
    </ModalBox>
  );
}
