import React, { useEffect } from 'react';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { FetchError, LoginForbiddenError } from '@/http-client';
import { useTranslations } from '@/hooks/useTranslations';
import { ErrorOutline } from '@mui/icons-material';
import { StyledError } from '@/components/GenericErrorPage';
import { Link } from 'react-router';
import { CenteredElementsContainer } from '@/components/CenteredElementsContainer';

const ErrorComponent = ({
  heading = 'virhe.palvelin.otsikko',
  message = 'virhe.palvelin.kuvaus',
  retry,
  t,
}: {
  heading?: string;
  message?: string;
  retry?: () => void;
  t: ReturnType<typeof useTranslations>['t'];
}) => {
  return (
    <>
      <title>t('otsikko')</title>
      <CenteredElementsContainer role="main">
        <StyledError>
          <ErrorOutline sx={{ fontSize: '2rem' }} />
        </StyledError>
        <OphTypography variant="h1">{t(heading)}</OphTypography>
        <OphTypography variant="body1">{t(message)}</OphTypography>
        {retry ? (
          <OphButton variant="contained" onClick={retry}>
            {t('virhe.palvelin.lataa')}
          </OphButton>
        ) : (
          <OphButton
            to="https://opintopolku.fi"
            component={Link}
            variant="contained"
          >
            {t('logout.opintopolun-etusivulle')}
          </OphButton>
        )}
      </CenteredElementsContainer>
    </>
  );
};

export function ErrorView({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | FetchError | LoginForbiddenError;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });
  const { t } = useTranslations();

  if (error instanceof LoginForbiddenError) {
    return (
      <ErrorComponent
        t={t}
        heading={'virhe.link-login.otsikko'}
        message={error.message}
      />
    );
  } else {
    return <ErrorComponent t={t} retry={reset} />;
  }
}
