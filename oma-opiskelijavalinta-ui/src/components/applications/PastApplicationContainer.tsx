import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from '../PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application, type Hakukohde } from '@/lib/application.service';
import { isTruthy } from 'remeda';
import { ExternalLink } from '../ExternalLink';
import { Hakutoive } from './Hakutoive';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

const StyledInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(0.5),
}));

function HakukohteetContainer({
  hakukohteet,
}: {
  hakukohteet: Array<Hakukohde>;
}) {
  return (
    <Box>
      {hakukohteet.map((hk, idx) => (
        <Hakutoive
          key={hk.oid}
          hakukohde={hk}
          prioriteetti={idx + 1}
          pastApplication={true}
        />
      ))}
    </Box>
  );
}

function PastTilaInfo({ application }: { application: Application }) {
  const { t } = useTranslations();

  return (
    <StyledInfoBox>
      {isTruthy(application.haku) && (
        <OphTypography>
          {t('hakemukset.tilankuvaukset.kaikki-julkaistu')}
        </OphTypography>
      )}
      {isTruthy(application.modifyLink) && (
        <ExternalLink
          href={application.modifyLink ?? ''}
          name={t('hakemukset.nayta')}
        />
      )}
    </StyledInfoBox>
  );
}

export function PastApplicationContainer({
  application,
}: {
  application: Application;
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <StyledPaper tabIndex={0}>
      <OphTypography variant="h3">
        {translateEntity(application?.haku?.nimi)}
      </OphTypography>
      <PastTilaInfo application={application} />
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <HakukohteetContainer hakukohteet={application?.hakukohteet ?? []} />
    </StyledPaper>
  );
}
