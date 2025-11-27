import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application } from '@/lib/application.service';
import { isTruthy } from 'remeda';
import { ExternalLink } from '../ExternalLink';
import { ApplicationPaper } from './ApplicationPaper';

export function FormOnlyApplicationContainer({
  application,
}: {
  application: Application;
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <ApplicationPaper tabIndex={0}>
      <OphTypography variant="h3">
        {translateEntity(application?.formName)}
      </OphTypography>
      {isTruthy(application.modifyLink) && (
        <ExternalLink
          href={application.modifyLink ?? ''}
          name={t('hakemukset.nayta')}
        />
      )}
    </ApplicationPaper>
  );
}
