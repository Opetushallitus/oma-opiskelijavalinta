import { Box, Typography } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from './PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from './QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getApplications,
  type Application,
  type Hakukohde,
} from '@/lib/application.service';
import { isEmpty } from 'remeda';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1),
}));

const HakukohdeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  columnGap: theme.spacing(2),
  borderTop: '1px solid',
  padding: `${theme.spacing(2)} 0`,
  borderColor: ophColors.grey100,
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}));

const OrderNumberBox = styled(Box)(({ theme }) => ({
  color: ophColors.white,
  backgroundColor: ophColors.grey400,
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.4)}`,
}));

function HakukohteetContainer({
  hakukohteet,
}: {
  hakukohteet: Array<Hakukohde>;
}) {
  const { translateEntity } = useTranslations();

  return (
    <Box>
      {hakukohteet.map((hk, idx) => (
        <HakukohdeContainer key={hk.oid}>
          <OrderNumberBox>{idx + 1}</OrderNumberBox>
          <Box>
            <Typography variant="h5">
              {translateEntity(hk.jarjestyspaikkaHierarkiaNimi)}
            </Typography>
            <Typography variant="body1">{translateEntity(hk.nimi)}</Typography>
          </Box>
        </HakukohdeContainer>
      ))}
    </Box>
  );
}

function ApplicationContainer({ application }: { application: Application }) {
  const { t, translateEntity } = useTranslations();

  return (
    <StyledPaper>
      <OphTypography variant="h3">
        {translateEntity(application.haku.nimi)}
      </OphTypography>
      <Typography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </Typography>
      <HakukohteetContainer hakukohteet={application.hakukohteet} />
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
