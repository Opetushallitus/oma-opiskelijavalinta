import { useTranslations } from '@/hooks/useTranslations';
import { ExternalLink } from '../ExternalLink';
import type { Hakemus } from '@/lib/hakemus-types';
import {
  DEFAULT_DATE_FORMAT,
  toFormattedDateTimeString,
} from '@/lib/localization/translation-utils';
import { useConfig } from '@/configuration';

export function KirjeLink({ hakemus }: { hakemus: Hakemus }) {
  const { t } = useTranslations();
  const config = useConfig();

  const kirjeModified = toFormattedDateTimeString(
    hakemus.tuloskirjeModified,
    DEFAULT_DATE_FORMAT,
  );

  return (
    <ExternalLink
      href={`${config.routes.tuloskirje}/${hakemus.haku?.oid}/hakemus/${hakemus.oid}`}
      name={t('tuloskirje', { pvm: kirjeModified })}
    />
  );
}
