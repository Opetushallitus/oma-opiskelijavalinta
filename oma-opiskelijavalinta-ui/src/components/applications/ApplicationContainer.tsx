import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from '../PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application, type Hakukohde } from '@/lib/application.service';
import { isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import { ApplicationInfo } from './ApplicationInfo';
import { Hakutoive } from './Hakutoive';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

function HakukohteetContainer({
  hakukohteet,
}: {
  hakukohteet: Array<Hakukohde>;
}) {
  return (
    <Box>
      {hakukohteet.map((hk, idx) => (
        <Hakutoive key={hk.oid} hakukohde={hk} prioriteetti={idx + 1} />
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
