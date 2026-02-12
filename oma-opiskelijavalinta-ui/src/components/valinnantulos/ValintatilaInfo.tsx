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
import {
  toFormattedDateTimeStringWithLocale,
  translateName,
} from '@/lib/localization/translation-utils';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useConfig } from '@/configuration';
import { isNonNullish } from 'remeda';
import { isKorkeakouluHaku, isToisenAsteenYhteisHaku } from '@/lib/kouta-utils';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import {
  getVarallaOlevatMuutToiveet,
  hasAlempiHyvaksytty,
  isEhdollisestiHyvaksyttyVastaanottanutSitovasti,
  isHyvaksytty,
} from '@/components/valinnantulos/valinnan-tulos-utils';
import { ExternalLinkParagraph } from '@/components/ExternalLink';
import { List, ListItem } from '@mui/material';
import { getVastaanottoPaattyyInfo } from '@/components/vastaanotto/VastaanottoInfo';
import {
  getVarallaOlevatYlemmatToiveet,
  vastaanotettavissa,
} from '@/components/vastaanotto/vastaanotto-utils';
import { styled } from '@/lib/theme';
import { EhdollisuusWarning } from '@/components/valinnantulos/EhdollisuusWarning';

const BulletItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  maxWidth: `calc(100% - ${theme.spacing(2.5)})`,
}));

const getVarasijallaInfo = (
  application: Hakemus,
  kk: boolean,
  priorisoidutHakutoiveet: boolean,
  lang: Language,
  t: TFnType<DefaultParamType, string, TranslationKey>,
) => {
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
      <OphTypography>{t('tulos.info.varasijalla')}</OphTypography>
      <OphTypography>
        <Translation
          keyName={'tulos.info.varasijalta-hyvaksyminen'}
          params={{
            varasijatayttoPaattyy,
            b: <b></b>,
          }}
        />
      </OphTypography>
    </>
  );
};

export const getEhdollisuusInfo = (
  tulos: HakutoiveenTulos,
  lang: Language,
  t: TFnType<DefaultParamType, string, TranslationKey>,
  naytaOtsikko = true,
) => {
  const config = useConfig();
  const ehdollisenHyvaksymisenEhto = tulos.ehdollisenHyvaksymisenEhto
    ? translateName(tulos.ehdollisenHyvaksymisenEhto, lang)
    : '';
  return (
    <>
      {naytaOtsikko && (
        <OphTypography variant="h5">
          {t('tulos.info.ehdollinen-otsikko')}
        </OphTypography>
      )}
      {tulos.valintatila === Valintatila.HYVAKSYTTY ? (
        <OphTypography>
          <Translation
            keyName={'tulos.info.ehdollinen-hyvaksytty'}
            params={{
              strong: <strong></strong>,
            }}
          />
        </OphTypography>
      ) : (
        <OphTypography>{t('tulos.info.ehdollinen-varalla')}</OphTypography>
      )}
      <List sx={{ listStyleType: 'disc', padding: 0 }}>
        <BulletItem disablePadding>{ehdollisenHyvaksymisenEhto}</BulletItem>
      </List>

      <OphTypography>
        {t('tulos.info.ehdollinen-lisatietoa')}{' '}
        <ExternalLinkParagraph
          name={t('tulos.info.hakijapalvelut')}
          href={`${config.routes.yleiset.konfo}/${lang}/sivu/korkeakoulujen-hakijapalvelut`}
          underline={'always'}
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
      <List
        component="ol"
        sx={{
          padding: 0,
          margin: 0,
          listStyleType: 'decimal',
          '& > li:not(:last-of-type)': {
            marginBottom: 1,
          },
        }}
      >
        <BulletItem disablePadding>
          {t('tulos.info.hyvaksytty-odottaa-ehto1')}
        </BulletItem>
        <BulletItem disablePadding>
          {t('tulos.info.hyvaksytty-odottaa-ehto2')}
        </BulletItem>
      </List>
      <OphTypography>
        {t('tulos.info.hyvaksytty-odottaa-peruuntuu')}
      </OphTypography>
    </>
  );
};

const getKkVastaanottoInfo = (
  hakemus: Hakemus,
  tulos: HakutoiveenTulos,
  yps: boolean | undefined,
  ylempiaVaralla: boolean,
  lang: Language,
  t: TFnType<DefaultParamType, string, TranslationKey>,
) => {
  const config = useConfig();
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    tulos.vastaanottoDeadline,
    lang,
  );

  const muitaHakutoiveitaVaralla =
    getVarallaOlevatMuutToiveet(hakemus, tulos.hakukohdeOid).length > 0;
  return (
    <>
      {tulos.vastaanotettavuustila === 'VASTAANOTETTAVISSA_EHDOLLISESTI' && (
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {t('vastaanotto.info.jonotus')}
        </OphTypography>
      )}
      {getVastaanottoPaattyyInfo(vastaanottoPaattyy, true)}
      {yps && (
        <OphTypography>
          {t('vastaanotto.info.yhden-paikan-saanto')}
        </OphTypography>
      )}
      {!hakemus.priorisoidutHakutoiveet && muitaHakutoiveitaVaralla && (
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {t('tulos.info.hyvaksytty-muut-peruuntuvat')}
        </OphTypography>
      )}
      {hakemus.priorisoidutHakutoiveet && ylempiaVaralla && (
        <OphTypography sx={{ fontWeight: 'bolder' }}>
          {t('vastaanotto.info.jonotus')}
        </OphTypography>
      )}
      <ExternalLinkParagraph
        name={t('vastaanotto.info.ohje-kk')}
        href={`${config.routes.yleiset.konfo}/${lang}/sivu/paikan-vastaanotto-ja-ilmoittautuminen-korkeakouluun`}
        underline={'always'}
      />
    </>
  );
};

const getVastaanottoInfo = (
  tulos: HakutoiveenTulos,
  ylempiaVaralla: boolean,
  lang: Language,
) => {
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    tulos.vastaanottoDeadline,
    lang,
  );
  return (
    <>
      {getVastaanottoPaattyyInfo(vastaanottoPaattyy, false)}
      {ylempiaVaralla && (
        <OphTypography>
          <Translation
            keyName={'vastaanotto.info.2aste-ylempia-varalla'}
            params={{
              b: <b></b>,
            }}
          />
        </OphTypography>
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

  const kkHaku = isKorkeakouluHaku(application.haku);

  const YPS = hakukohde && hakukohde.yhdenPaikanSaanto?.voimassa;
  const toisenAsteenYhteisHaku = isToisenAsteenYhteisHaku(application.haku);

  const toinenAsteVarallaYlempaanAlempiHyvaksytty =
    tulos.valintatila === Valintatila.VARALLA &&
    toisenAsteenYhteisHaku &&
    hakukohde &&
    hasAlempiHyvaksytty(tulos.hakukohdeOid, application);

  const ylempiaVaralla =
    isNonNullish(hakukohde) &&
    getVarallaOlevatYlemmatToiveet(application, hakukohde).length > 0;
  return (
    <MultiInfoContainer data-test-id={`valintatilainfo-${tulos.hakukohdeOid}`}>
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
        vastaanotettavissa(tulos.vastaanotettavuustila) &&
        getKkVastaanottoInfo(application, tulos, YPS, ylempiaVaralla, lang, t)}
      {!kkHaku &&
        isHyvaksytty(tulos.valintatila) &&
        vastaanotettavissa(tulos.vastaanotettavuustila) &&
        getVastaanottoInfo(tulos, ylempiaVaralla, lang)}
      {odottaaYlempaa && getOdottaaYlempaaInfo(t)}
      {tulos.ehdollisestiHyvaksyttavissa && getEhdollisuusInfo(tulos, lang, t)}
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

  if (isEhdollisestiHyvaksyttyVastaanottanutSitovasti(tulos)) {
    return <EhdollisuusWarning tulos={tulos} />;
  }
  const info = getInfoText(
    t,
    getLanguage(),
    tulos,
    application,
    odottaaYlempaa,
  );

  return <InfoBox>{info}</InfoBox>;
}
