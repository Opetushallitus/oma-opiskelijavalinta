import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { Link } from 'react-router';
import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { CenteredElementsContainer } from '@/components/CenteredElementsContainer';
import { Check } from '@mui/icons-material';

export const StyledCheckCircle = styled(Box)(({ theme }) => ({
  color: ophColors.white,
  fontSize: '2rem',
  backgroundColor: ophColors.green2,
  padding: theme.spacing(1.5),
  borderRadius: '45px',
  width: 'fit-content',
}));

const LoggedOutPage = () => {
  const { t } = useTranslations();
  return (
    <>
      <title>{t('otsikko')}</title>
      <CenteredElementsContainer role="main">
        <StyledCheckCircle>
          <Check sx={{ fontSize: '2rem' }} />
        </StyledCheckCircle>
        <OphTypography variant="h1">{t('logout.otsikko')}</OphTypography>
        <OphTypography variant="body1">{t('logout.info')}</OphTypography>
        <OphButton
          to="https://opintopolku.fi"
          component={Link}
          variant="contained"
        >
          {t('logout.opintopolun-etusivulle')}
        </OphButton>
      </CenteredElementsContainer>
    </>
  );
};

export default LoggedOutPage;
