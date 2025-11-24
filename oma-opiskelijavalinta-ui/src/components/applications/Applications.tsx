import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from '../QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getApplications } from '@/lib/application.service';
import { isEmpty } from 'remeda';
import { ApplicationContainer } from './ApplicationContainer';
import { InfoBox } from '../InfoBox';
import { PastApplicationContainer } from './PastApplicationContainer';

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
      {applications?.current.map((application) => (
        <ApplicationContainer
          key={`application-${application.oid}}`}
          application={application}
        />
      ))}
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
      {applications?.old.map((application) => (
        <PastApplicationContainer
          key={`application-${application.oid}}`}
          application={application}
        />
      ))}
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
