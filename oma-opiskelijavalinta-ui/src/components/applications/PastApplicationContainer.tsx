import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application, type Hakukohde } from '@/lib/application.service';
import { isTruthy } from 'remeda';
import { ExternalLink } from '../ExternalLink';
import { Hakutoive } from './Hakutoive';
import { ApplicationPaper } from './ApplicationPaper';

const StyledInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(0.5),
}));

function PastHakukohteetContainer({
  hakukohteet,
  priorisoidutHakutoiveet,
  application,
}: {
  hakukohteet: Array<Hakukohde>;
  priorisoidutHakutoiveet: boolean;
  application: Application;
}) {
  return (
    <Box sx={{ width: '100%' }}>
      {hakukohteet.map((hk, idx) => (
        <Hakutoive
          application={application}
          key={hk.oid}
          hakukohde={hk}
          prioriteetti={idx + 1}
          pastApplication={true}
          priorisoidutHakutoiveet={priorisoidutHakutoiveet}
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
    <ApplicationPaper
      tabIndex={0}
      data-test-id={`past-application-${application.oid}`}
    >
      <OphTypography variant="h3">
        {translateEntity(application?.haku?.nimi)}
      </OphTypography>
      <PastTilaInfo application={application} />
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <PastHakukohteetContainer
        application={application}
        hakukohteet={application?.hakukohteet ?? []}
        priorisoidutHakutoiveet={application?.priorisoidutHakutoiveet}
      />
    </ApplicationPaper>
  );
}
