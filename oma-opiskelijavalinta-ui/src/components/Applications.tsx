import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from './PaperWithTopColor';
import { styled } from '@/lib/theme';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
}));

export default function Applications() {
  return (
    <Box>
      <OphTypography variant="h2">Ajankohtaiset hakemukset</OphTypography>
      <StyledPaper>Tähän hakemustiedot</StyledPaper>
    </Box>
  );
}
