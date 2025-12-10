import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { isTruthy } from 'remeda';
import type { Haku } from '@/lib/kouta-types';
import type { Application } from '@/lib/application-types';

function HakuMuokkausInfo({ haku }: { haku: Haku }) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();
  const hakuaikaPaattyy = toFormattedDateTimeStringWithLocale(
    haku.viimeisinPaattynytHakuAika, //Tämä saattaa muuttua riippuen OPHYOS-49:n toteutuksesta
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

export function ApplicationInfo({ application }: { application: Application }) {
  return isTruthy(application.haku) ? (
    <HakuMuokkausInfo haku={application.haku} />
  ) : null;
}
