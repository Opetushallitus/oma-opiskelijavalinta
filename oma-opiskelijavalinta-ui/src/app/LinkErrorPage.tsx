import { useTranslations } from '@/hooks/useTranslations';
import { ErrorPageIcon } from '@/components/ErrorPageIcon';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Link } from 'react-router';
import React from 'react';
import LinkLoginBanner from '@/components/LinkLoginBanner';
import { CenteredElementsContainer } from '@/components/CenteredElementsContainer';

const LinkErrorPage = () => {
  const { t } = useTranslations();
  return (
    <>
      <LinkLoginBanner hideLogoutButton={true} />
      <title>{t('otsikko')}</title>
      <CenteredElementsContainer role="main">
        <ErrorPageIcon />
        <OphTypography variant="h1">
          {t('virhe.tuloskirje-link.otsikko')}
        </OphTypography>
        <OphTypography variant="body1">
          {t('virhe.tuloskirje-link.teksti')}
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

export default LinkErrorPage;
