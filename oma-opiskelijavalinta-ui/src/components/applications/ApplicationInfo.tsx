import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application } from '@/lib/application.service';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';

export function ApplicationInfo({ application }: { application: Application }) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();
  const hakuaikaPaattyy = toFormattedDateTimeStringWithLocale(
    application.hakukierrosPaattyy,
    lang,
  );

  return (
    <InfoBox>
      <OphTypography>{t('hakemukset.info.lahettanyt')}</OphTypography>
      <br />
      <OphTypography>
        {t('hakemukset.info.voit-muokata', { hakuaikaPaattyy })}
      </OphTypography>
    </InfoBox>
  );
}
