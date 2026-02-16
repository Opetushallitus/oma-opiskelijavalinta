import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ExternalLink } from '../ExternalLink';
import { HakemusPaper } from './HakemusPaper';
import type { Hakemus } from '@/lib/hakemus-types';
import { isTruthy } from 'remeda';
import { MenneetHakukohteetAccordion } from '../hakukohde/HakukohteetAccordion';

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
      <ExternalLink
        href={hakemus.modifyLink ?? ''}
        name={t('hakemukset.nayta')}
      />
      <MenneetHakukohteetAccordion hakemus={hakemus} haku={hakemus.haku} />
    </HakemusPaper>
  );
}
