import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from './PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
}));

export default function Applications() {
  const { t } = useTranslations();

  return (
    <Box>
      <OphTypography variant="h2">
        {t('hakemukset.ajankohtaiset')}
      </OphTypography>
      <StyledPaper>{t('hakemukset.ei-hakemuksia')}</StyledPaper>
    </Box>
  );
}
