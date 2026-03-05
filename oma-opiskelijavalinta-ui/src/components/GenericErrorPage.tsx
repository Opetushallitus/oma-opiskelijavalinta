import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { CenteredElementsContainer } from '@/components/CenteredElementsContainer';
import { ErrorPageIcon } from '@/components/ErrorPageIcon';

export function GenericErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error);
  });
  const { t } = useTranslations();
  return (
    <>
      <title>Oma Opiskelijavalinta</title>
      <CenteredElementsContainer role="main">
        <ErrorPageIcon />
        <OphTypography variant="h1">
          {t('virhe.palvelin.otsikko')}
        </OphTypography>
        <OphTypography variant="body1">
          {t('virhe.palvelin.kuvaus')}
        </OphTypography>
        <OphButton variant="contained" onClick={() => window.location.reload()}>
          {t('virhe.palvelin.lataa')}
        </OphButton>
      </CenteredElementsContainer>
    </>
  );
}
