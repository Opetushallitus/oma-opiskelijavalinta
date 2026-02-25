import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Link } from 'react-router';
import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';

const StyledHeader = styled(OphTypography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const LoggedOutPage = () => {
  const { t } = useTranslations();
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <StyledHeader variant="h1">{t('logout.otsikko')}</StyledHeader>
      <OphButton
        to="https://opintopolku.fi"
        component={Link}
        variant="outlined"
      >
        {t('logout.opintopolun-etusivulle')}
      </OphButton>
    </div>
  );
};

export default LoggedOutPage;
