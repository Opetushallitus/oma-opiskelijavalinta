import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';
import { Link } from 'react-router';
import { useTranslations } from '@/hooks/useTranslations';

const NotFoundPage = () => {
  const { t } = useTranslations();
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <OphTypography variant="h1">{t('virhe.sivua-ei-löytynyt')}</OphTypography>
      <OphTypography component="p">{t('virhe.tarkista-osoite')}</OphTypography>
      <OphButton to="/" component={Link} variant="contained">
        {t('mene-etusivulle')}
      </OphButton>
    </div>
  );
};

export default NotFoundPage;
