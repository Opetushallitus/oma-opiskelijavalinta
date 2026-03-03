import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ExternalLink } from '../ExternalLink';
import { HakemusPaper } from './HakemusPaper';
import type { Hakemus } from '@/lib/hakemus-types';
import { isTruthy } from 'remeda';
import { MenneetHakukohteetAccordion } from '../hakukohde/HakukohteetAccordion';
import { Divider } from '@mui/material';
import { KirjeLink } from './KirjeLink';
import { RowFlexBox } from '../FlexBox';

export function MennytHakemusContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t, translateEntity } = useTranslations();

  if (!isTruthy(hakemus.haku)) {
    console.warn('Haku pitäisi olla hakemuksella: ', hakemus.oid);
    return null;
  }

  return (
    <HakemusPaper tabIndex={0} data-test-id={`past-application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.haku?.nimi)}
      </OphTypography>
      <RowFlexBox>
        {hakemus.modifyLink && (
          <ExternalLink
            href={hakemus.modifyLink}
            name={t('hakemukset.nayta')}
          />
        )}
        {hakemus.modifyLink && hakemus.tuloskirjeModified && (
          <Divider
            sx={{ borderColor: ophColors.black }}
            orientation="vertical"
            flexItem
          />
        )}
        {hakemus.tuloskirjeModified && <KirjeLink hakemus={hakemus} />}
      </RowFlexBox>
      <MenneetHakukohteetAccordion hakemus={hakemus} haku={hakemus.haku} />
    </HakemusPaper>
  );
}
