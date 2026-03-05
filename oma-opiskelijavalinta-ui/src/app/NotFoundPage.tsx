import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';
import { Link } from 'react-router';
import { useTranslations } from '@/hooks/useTranslations';
import { ErrorOutline } from '@mui/icons-material';
import { StyledError } from '@/components/GenericErrorPage';
import { CenteredElementsContainer } from '@/components/CenteredElementsContainer';

const NotFoundPage = () => {
  const { t } = useTranslations();
  return (
    <>
      <title>{t('otsikko')}</title>
      <CenteredElementsContainer role="main">
        <StyledError>
          <ErrorOutline sx={{ fontSize: '2rem' }} />
        </StyledError>
        <OphTypography variant="h1">
          {t('virhe.sivua-ei-loytynyt')}
        </OphTypography>
        <OphTypography variant="body1">
          {t('virhe.tarkista-osoite')}
        </OphTypography>
        <OphButton
          to="https://opintopolku.fi"
          component={Link}
          variant="contained"
        >
          {t('virhe.mene-etusivulle')}
        </OphButton>
      </CenteredElementsContainer>
    </>
  );
};

export default NotFoundPage;
