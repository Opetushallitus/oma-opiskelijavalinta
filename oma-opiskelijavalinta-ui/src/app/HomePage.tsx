import Hakemukset from '@/components/hakemukset/Hakemukset';
import Info from '@/components/Info';
import { QuerySuspenseBoundary } from '@/components/QuerySuspenseBoundary';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(4),
}));

const StyledHeader = styled(OphTypography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export default function HomePage() {
  const { t } = useTranslations();

  return (
    <Box>
      <StyledHeader variant="h1">{t('otsikko')}</StyledHeader>
      <StyledBox>
        <QuerySuspenseBoundary>
          <Info />
        </QuerySuspenseBoundary>
        <Hakemukset />
      </StyledBox>
    </Box>
  );
}
