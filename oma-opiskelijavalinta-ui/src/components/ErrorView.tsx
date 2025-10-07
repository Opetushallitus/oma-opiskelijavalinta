import { useEffect } from 'react';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';
import { FetchError } from '@/http-client';

const ErrorComponent = ({
  title,
  message,
  retry,
}: {
  title?: string;
  message?: React.ReactNode;
  retry?: () => void;
}) => {
  return (
    <Stack spacing={1} sx={{ margin: 2 }} alignItems="flex-start">
      {title && (
        <OphTypography variant="h1" component="div">
          {title}
        </OphTypography>
      )}
      {message && <OphTypography component="div">{message}</OphTypography>}
      {retry && (
        <OphButton variant="contained" onClick={retry}>
          Yritä uudelleen
        </OphButton>
      )}
    </Stack>
  );
};

export function ErrorView({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | FetchError;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  });

  if (error instanceof FetchError) {
    return (
      <ErrorComponent
        title="Palvelinvirhe"
        message={
          <Stack spacing={1}>
            <OphTypography sx={{ overflowWrap: 'anywhere' }}>
              URL: {error.response.url}
            </OphTypography>
            <OphTypography>
              Virhekoodi {error.response.status}
            </OphTypography>
          </Stack>
        }
        retry={reset}
      />
    );
  } else {
    return <ErrorComponent title="Tuntematon virhe" />;
  }
}
