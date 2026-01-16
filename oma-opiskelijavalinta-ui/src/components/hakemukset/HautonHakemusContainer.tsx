import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isTruthy } from 'remeda';
import { ExternalLink } from '../ExternalLink';
import { HakemusPaper } from './HakemusPaper';
import type { Hakemus } from '@/lib/hakemus-types';

export function HautonHakemusContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t, translateEntity } = useTranslations();

  return (
    <HakemusPaper tabIndex={0} data-test-id={`application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.formName)}
      </OphTypography>
      {isTruthy(hakemus.modifyLink) && (
        <ExternalLink
          href={hakemus.modifyLink ?? ''}
          name={t('hakemukset.nayta')}
        />
      )}
    </HakemusPaper>
  );
}
