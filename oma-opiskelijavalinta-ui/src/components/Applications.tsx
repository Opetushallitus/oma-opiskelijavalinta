import { Box, Typography } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from './PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from './QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getApplications, type Application } from '@/lib/application.service';
import { isEmpty } from 'remeda';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
}));

function ApplicationContainer({ application }: { application: Application }) {
  const { t } = useTranslations();

  return (
    <StyledPaper>
      <OphTypography variant="h3">{application.haku}</OphTypography>
      <Typography>{t('hakemukset.hakutoiveet')}</Typography>
      {application.hakukohteet.map((hk) => (
        <Typography variant="h4" key={hk}>
          {hk}
        </Typography>
      ))}
    </StyledPaper>
  );
}

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
          key={application.haku}
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
