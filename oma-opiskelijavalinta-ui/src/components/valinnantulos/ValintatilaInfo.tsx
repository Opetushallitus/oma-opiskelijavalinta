import { type HakutoiveenTulos, Valintatila } from '@/lib/valinta-tulos-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { useTranslations } from '@/hooks/useTranslations';
import {
  type DefaultParamType,
  T as Translation,
  type TFnType,
  type TranslationKey,
} from '@tolgee/react';
import { InfoBox } from '@/components/InfoBox';
import type { Language } from '@/types/ui-types';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useConfig } from '@/configuration';
import { isNonNullish } from 'remeda';
import { isKorkeakouluHaku, isToisenAsteenYhteisHaku } from '@/lib/kouta-utils';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import {
  hasAlempiHyvaksytty,
  isHyvaksytty,
} from '@/components/valinnantulos/valinnan-tulos-utils';
import { ExternalLink } from '@/components/ExternalLink';
import { List, ListItem } from '@mui/material';
import { getVastaanottoPaattyyInfo } from '@/components/vastaanotto/VastaanottoInfo';

const getVarasijallaInfo = (
  application: Hakemus,
  kk: boolean,
  priorisoidutHakutoiveet: boolean,
  lang: Language,
  t: TFnType<DefaultParamType, string, TranslationKey>,
) => {
  console.log('kk in varasijalla info:', kk);
  console.log(
    'priorisoidutHakutoiveet in varasijalla info:',
    priorisoidutHakutoiveet,
  );
  console.log(
    'priorisoidutHakutoiveet value:',
    priorisoidutHakutoiveet,
    'type:',
    typeof priorisoidutHakutoiveet,
  );
  const varasijatayttoPaattyy = toFormattedDateTimeStringWithLocale(
    application.varasijatayttoPaattyy,
    lang,
  );
  return (
    <>
      {kk && !priorisoidutHakutoiveet && (
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {t('tulos.info.varalla-peruuntuu')}
        </OphTypography>
      )}
      <OphTypography>
        <Translation
          keyName={'tulos.info.varasijalla'}
          params={{
            varasijatayttoPaattyy,
            br: <br />,
          }}
        />
      </OphTypography>
    </>
  );
};

const getEhdollisuusInfo = (
  lang: Language,
  t: TFnType<DefaultParamType, string, TranslationKey>,
) => {
  const config = useConfig();
  return (
    <>
      <OphTypography>{t('tulos.info.ehdollinen')}</OphTypography>
      <List>
        <ListItem>TODO tiketillä OPHYOS-32</ListItem>
      </List>
      <OphTypography>
        {t('tulos.info.ehdollinen-lisatietoa')}{' '}
        <ExternalLink
          name={t('tulos.info.hakijapalvelut')}
          href={`${config.routes.yleiset.konfo}/${lang}/sivu/korkeakoulujen-hakijapalvelut`}
        />
      </OphTypography>
    </>
  );
};

const getOdottaaYlempaaInfo = (
  t: TFnType<DefaultParamType, string, TranslationKey>,
) => {
  return (
    <>
      <OphTypography>
        {t('tulos.info.hyvaksytty-odottaa-ylempaa')}
      </OphTypography>
      <List>
        <ListItem>{t('tulos.info.hyvaksytty-odottaa-ehto1')}</ListItem>
        <ListItem>{t('tulos.info.hyvaksytty-odottaa-ehto2')}</ListItem>
      </List>
      <OphTypography>
        {t('tulos.info.hyvaksytty-odottaa-peruuntuu')}
      </OphTypography>
    </>
  );
};

const getVastaanottoInfo = (
  tulos: HakutoiveenTulos,
  kk: boolean,
  yps: boolean | undefined,
  priorisoidutHakutoiveet: boolean,
  lang: Language,
  t: TFnType<DefaultParamType, string, TranslationKey>,
) => {
  const config = useConfig();
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    tulos.vastaanottoDeadline,
    lang,
  );
  return (
    <>
      {getVastaanottoPaattyyInfo(vastaanottoPaattyy)}
      {kk && yps && (
        <OphTypography>
          {t('vastaanotto.info.yhden-paikan-saanto')}
        </OphTypography>
      )}
      {kk && !priorisoidutHakutoiveet && (
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {t('tulos.info.hyvaksytty-muut-peruuntuvat')}
        </OphTypography>
      )}
      {kk && (
        <ExternalLink
          name={t('vastaanotto.info.ohje-kk')}
          href={`${config.routes.yleiset.konfo}/${lang}/sivu/paikan-vastaanotto-ja-ilmoittautuminen-korkeakouluun`}
        />
      )}
    </>
  );
};

const getInfoText = (
  t: TFnType<DefaultParamType, string, TranslationKey>,
  lang: Language,
  tulos: HakutoiveenTulos,
  application: Hakemus,
  odottaaYlempaa: boolean,
) => {
  const hakukohde = application.hakukohteet?.find(
    (hk) => hk.oid === tulos.hakukohdeOid,
  );

  const kkHaku =
    isNonNullish(application.haku) && isKorkeakouluHaku(application.haku);

  const YPS = hakukohde && hakukohde.yhdenPaikanSaanto?.voimassa;
  const toisenAsteenYhteisHaku =
    isNonNullish(application.haku) &&
    isToisenAsteenYhteisHaku(application.haku);

  const toinenAsteVarallaYlempaanAlempiHyvaksytty =
    tulos.valintatila === Valintatila.VARALLA &&
    toisenAsteenYhteisHaku &&
    hakukohde &&
    hasAlempiHyvaksytty(tulos.hakukohdeOid, application);

  return (
    <MultiInfoContainer>
      {toinenAsteVarallaYlempaanAlempiHyvaksytty && (
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {t('tulos.info.varalla-ylempaan-alempi-hyvaksytty')}
        </OphTypography>
      )}
      {tulos.valintatila === Valintatila.VARALLA &&
        getVarasijallaInfo(
          application,
          kkHaku,
          application.priorisoidutHakutoiveet,
          lang,
          t,
        )}
      {kkHaku &&
        isHyvaksytty(tulos.valintatila) &&
        getVastaanottoInfo(
          tulos,
          kkHaku,
          YPS,
          application.priorisoidutHakutoiveet,
          lang,
          t,
        )}
      {tulos.ehdollisestiHyvaksyttavissa && getEhdollisuusInfo(lang, t)}
      {odottaaYlempaa && getOdottaaYlempaaInfo(t)}
    </MultiInfoContainer>
  );
};

export function ValintatilaInfo({
  tulos,
  application,
  odottaaYlempaa,
}: {
  tulos: HakutoiveenTulos;
  application: Hakemus;
  odottaaYlempaa: boolean;
}) {
  const { getLanguage, t } = useTranslations();

  const info = getInfoText(
    t,
    getLanguage(),
    tulos,
    application,
    odottaaYlempaa,
  );

  // näytetään info jos ehdollinen / varalla / kaikki hylätty
  return <InfoBox>{info}</InfoBox>;
}
