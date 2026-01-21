import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { isTruthy } from 'remeda';
import { ExternalLink } from '../ExternalLink';
import { Hakutoive } from '../hakukohde/Hakutoive';
import { HakemusPaper } from './HakemusPaper';
import type { Hakukohde } from '@/lib/kouta-types';
import type { Hakemus } from '@/lib/hakemus-types';

const StyledInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(0.5),
}));

function PastHakukohteetContainer({
  hakemus,
  hakukohteet,
}: {
  hakemus: Hakemus;
  hakukohteet: Array<Hakukohde>;
}) {
  return (
    <Box sx={{ width: '100%' }}>
      {hakukohteet.map((hk, idx) => (
        <Hakutoive
          hakemus={hakemus}
          key={hk.oid}
          hakukohde={hk}
          prioriteetti={idx + 1}
          pastApplication={true}
        />
      ))}
    </Box>
  );
}

function PastTilaInfo({ application }: { application: Hakemus }) {
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

export function MennytHakemusContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t, translateEntity } = useTranslations();

  return (
    <HakemusPaper tabIndex={0} data-test-id={`past-application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.haku?.nimi)}
      </OphTypography>
      <PastTilaInfo application={hakemus} />
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <PastHakukohteetContainer
        hakemus={hakemus}
        hakukohteet={hakemus?.hakukohteet ?? []}
      />
    </HakemusPaper>
  );
}
