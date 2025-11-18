import { Box } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from '../PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application, type Hakukohde } from '@/lib/application.service';
import { isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import { ApplicationInfo } from './ApplicationInfo';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
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
            <OphTypography variant="h5">
              {translateEntity(hk.jarjestyspaikkaHierarkiaNimi)}
            </OphTypography>
            <OphTypography variant="body1">
              {translateEntity(hk.nimi)}
            </OphTypography>
          </Box>
        </HakukohdeContainer>
      ))}
    </Box>
  );
}

export function ApplicationContainer({
  application,
}: {
  application: Application;
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <StyledPaper tabIndex={0}>
      <OphTypography variant="h3">
        {translateEntity(application.haku.nimi)}
      </OphTypography>
      <ApplicationInfo application={application} />
      {isTruthy(application.modifyLink) && (
        <ExternalLinkButton
          href={application.modifyLink ?? ''}
          name={t('hakemukset.muokkaa')}
        />
      )}
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <HakukohteetContainer hakukohteet={application.hakukohteet} />
    </StyledPaper>
  );
}
