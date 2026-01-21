import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import {
  T as Translation,
  type DefaultParamType,
  type TFnType,
  type TranslationKey,
} from '@tolgee/react';
import {
  VastaanottoTila,
  type HakutoiveenTulos,
} from '@/lib/valinta-tulos-types';
import type { Language } from '@/types/ui-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { isKorkeakouluHaku, isToisenAsteenYhteisHaku } from '@/lib/kouta-utils';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { isNonNullish } from 'remeda';
import { getAlemmatVastaanotot } from './vastaanotto-utils';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';

const getEhdollisestiVastaanottanutInfo = (
  application: Hakemus,
  lang: Language,
) => {
  const varasijatayttoPaattyy = toFormattedDateTimeStringWithLocale(
    application.varasijatayttoPaattyy,
    lang,
  );
  return (
    <OphTypography>
      <Translation
        keyName={'vastaanotto.info.ylempi-automaattisesti'}
        params={{
          varasijatayttoPaattyy,
          br: <br />,
        }}
      />
    </OphTypography>
  );
};

export const getVastaanottoPaattyyInfo = (vastaanottoPaattyy: string) => (
  <OphTypography>
    <Translation
      keyName={'vastaanotto.info.paattyy'}
      params={{
        vastaanottoPaattyy,
        strong: <strong />,
      }}
    />
  </OphTypography>
);

const getInfoText = (
  t: TFnType<DefaultParamType, string, TranslationKey>,
  lang: Language,
  tulos: HakutoiveenTulos,
  application: Hakemus,
) => {
  const config = useConfig();
  const hakukohde = application.hakukohteet?.find(
    (hk) => hk.oid === tulos.hakukohdeOid,
  );
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    tulos.vastaanottoDeadline,
    lang,
  );

  const kkHaku =
    isNonNullish(application.haku) && isKorkeakouluHaku(application.haku);

  const yksiAlempiVastaanotto =
    hakukohde &&
    isNonNullish(application.haku) &&
    isToisenAsteenYhteisHaku(application.haku) &&
    getAlemmatVastaanotot(hakukohde, application).length === 1;

  const useampiAlempiVastaanotto =
    hakukohde &&
    isNonNullish(application.haku) &&
    isToisenAsteenYhteisHaku(application.haku) &&
    getAlemmatVastaanotot(hakukohde, application).length > 1;

  const YPS = hakukohde && hakukohde.yhdenPaikanSaanto?.voimassa;

  const hakutoiveIdx =
    application.hakukohteet?.findIndex((hk) => hk.oid === tulos.hakukohdeOid) ??
    0;

  if (tulos.vastaanottotila === VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT) {
    return getEhdollisestiVastaanottanutInfo(application, lang);
  } else {
    return (
      <MultiInfoContainer>
        {application.priorisoidutHakutoiveet && (
          <OphTypography>
            {t('vastaanotto.info.priorisoitu', {
              hakutoiveNro: hakutoiveIdx + 1,
            })}
          </OphTypography>
        )}
        {getVastaanottoPaattyyInfo(vastaanottoPaattyy)}
        {kkHaku && YPS && (
          <OphTypography>
            {t('vastaanotto.info.yhden-paikan-saanto')}
          </OphTypography>
        )}
        {tulos.vastaanotettavuustila === 'VASTAANOTETTAVISSA_EHDOLLISESTI' && (
          <OphTypography sx={{ fontWeight: 'bolder' }}>
            {t('vastaanotto.info.jonotus')}
          </OphTypography>
        )}
        {yksiAlempiVastaanotto && (
          <OphTypography sx={{ fontWeight: 'bolder' }}>
            {t('vastaanotto.info.peru-alempi')}
          </OphTypography>
        )}
        {useampiAlempiVastaanotto && (
          <OphTypography sx={{ fontWeight: 'bolder' }}>
            {t('vastaanotto.info.peru-alemmat')}
          </OphTypography>
        )}
        {kkHaku && (
          <ExternalLink
            name={t('vastaanotto.info.ohje-kk')}
            href={`${config.routes.yleiset.konfo}/${lang}/sivu/paikan-vastaanotto-ja-ilmoittautuminen-korkeakouluun`}
          />
        )}
      </MultiInfoContainer>
    );
  }
};

export function VastaanottoInfo({
  tulos,
  application,
}: {
  tulos: HakutoiveenTulos;
  application: Hakemus;
}) {
  const { getLanguage, t } = useTranslations();

  const info = getInfoText(t, getLanguage(), tulos, application);

  return <InfoBox>{info}</InfoBox>;
}
