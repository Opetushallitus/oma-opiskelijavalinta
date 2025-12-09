import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from '../QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getApplications } from '@/lib/application.service';
import { isEmpty, isNonNullish } from 'remeda';
import { ApplicationContainer } from './ApplicationContainer';
import { InfoBox } from '../InfoBox';
import { PastApplicationContainer } from './PastApplicationContainer';
import { FormOnlyApplicationContainer } from './FormOnlyApplicationContainer';
import type { JSX } from 'react';
import type { Application } from '@/lib/application-types';

function determineApplicationType(
  application: Application,
  past = false,
): JSX.Element {
  return isNonNullish(application.haku) && past ? (
    <PastApplicationContainer
      key={`application-${application.oid}}`}
      application={application}
    />
  ) : isNonNullish(application.haku) ? (
    <ApplicationContainer
      key={`application-${application.oid}}`}
      application={application}
    />
  ) : (
    <FormOnlyApplicationContainer // OPHYOS-52:ssa tämän paikka saattaa muuttua
      key={`application-${application.oid}}`}
      application={application}
    />
  );
}

function ApplicationList() {
  const { t } = useTranslations();

  const { data: applications } = useSuspenseQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  return isEmpty(applications.current) ? (
    <InfoBox sx={{ marginTop: '1.5rem' }}>
      {t('hakemukset.ei-hakemuksia')}
    </InfoBox>
  ) : (
    <>
      {applications?.current.map((application) =>
        determineApplicationType(application),
      )}
    </>
  );
}

function PastApplicationList() {
  const { t } = useTranslations();

  const { data: applications } = useSuspenseQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  return isEmpty(applications.old) ? (
    <InfoBox sx={{ marginTop: '1.5rem' }}>
      {t('hakemukset.ei-menneita-hakemuksia')}
    </InfoBox>
  ) : (
    <>
      {applications?.old.map((application) =>
        determineApplicationType(application, true),
      )}
    </>
  );
}

export default function Applications() {
  const { t } = useTranslations();

  return (
    <>
      <Box data-test-id="active-applications">
        <OphTypography variant="h2">
          {t('hakemukset.ajankohtaiset')}
        </OphTypography>
        <QuerySuspenseBoundary>
          <ApplicationList />
        </QuerySuspenseBoundary>
      </Box>
      <Box data-test-id="past-applications">
        <OphTypography variant="h2">{t('hakemukset.menneet')}</OphTypography>
        <QuerySuspenseBoundary>
          <PastApplicationList />
        </QuerySuspenseBoundary>
      </Box>
    </>
  );
}
