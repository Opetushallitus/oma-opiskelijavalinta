import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { ErrorOutline } from '@mui/icons-material';
import { useTranslations } from '@/hooks/useTranslations';

const StyledError = styled(Box)(({ theme }) => ({
  color: ophColors.white,
  fontSize: '2rem',
  backgroundColor: ophColors.orange3,
  padding: theme.spacing(1.5),
  borderRadius: '45px',
  width: 'fit-content',
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(3),
  width: 'fit-content',
  alignItems: 'center',
  marginTop: theme.spacing(8),
}));

export function GenericErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  });

  const { t } = useTranslations();

  return (
    <ErrorContainer>
      <StyledError>
        <ErrorOutline sx={{ fontSize: '2rem' }} />
      </StyledError>
      <OphTypography variant="h1">{t('virhe.palvelin.otsikko')}</OphTypography>
      <OphTypography variant="body1">
        {t('virhe.palvelin.kuvaus')}
      </OphTypography>
      <OphButton variant="contained">{t('virhe.palvelin.lataa')}</OphButton>
    </ErrorContainer>
  );
}
