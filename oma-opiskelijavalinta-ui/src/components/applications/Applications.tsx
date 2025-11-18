import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from '../QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getApplications } from '@/lib/application.service';
import { isEmpty } from 'remeda';
import { ApplicationContainer } from './ApplicationContainer';

function ApplicationList() {
  const { t } = useTranslations();

  const { data: applications } = useSuspenseQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  return isEmpty(applications) ? (
    <OphTypography>{t('hakemukset.ei-hakemuksia')}</OphTypography>
  ) : (
    <>
      {applications?.map((application) => (
        <ApplicationContainer
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
    <Box data-test-id="active-applications">
      <OphTypography variant="h2">
        {t('hakemukset.ajankohtaiset')}
      </OphTypography>
      <QuerySuspenseBoundary>
        <ApplicationList />
      </QuerySuspenseBoundary>
    </Box>
  );
}
