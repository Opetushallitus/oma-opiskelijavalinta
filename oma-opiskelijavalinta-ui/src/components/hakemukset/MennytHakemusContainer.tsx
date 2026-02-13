import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ExternalLink } from '../ExternalLink';
import { Hakutoive } from '../hakukohde/Hakutoive';
import { HakemusPaper } from './HakemusPaper';
import type { Hakukohde } from '@/lib/kouta-types';
import type { Hakemus } from '@/lib/hakemus-types';

function MenneetHakukohteetContainer({
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

export function MennytHakemusContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t, translateEntity } = useTranslations();

  return (
    <HakemusPaper tabIndex={0} data-test-id={`past-application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.haku?.nimi)}
      </OphTypography>
      <ExternalLink
        href={hakemus.modifyLink ?? ''}
        name={t('hakemukset.nayta')}
      />
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <MenneetHakukohteetContainer
        hakemus={hakemus}
        hakukohteet={hakemus?.hakukohteet ?? []}
      />
    </HakemusPaper>
  );
}
