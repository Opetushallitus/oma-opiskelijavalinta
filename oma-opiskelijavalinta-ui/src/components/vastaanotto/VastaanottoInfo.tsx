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
import { ExternalLinkParagraph } from '../ExternalLink';
import { useConfig } from '@/configuration';
import {
  getAlemmatVastaanotot,
  getVarallaOlevatYlemmatTuloksetJoissaOnPaatettaviaOpiskeluoikeuksia,
  naytetaankoPeruuntuvatOpiskelupaikat,
  naytetaankoYosVirhe,
} from './vastaanotto-utils';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import { getEhdollisuusInfo } from '@/components/valinnantulos/ValintatilaInfo';
import {
  getVarallaOlevatMuutToiveet,
  naytetaankoEhdollisuus,
} from '@/components/valinnantulos/valinnan-tulos-utils';
import {
  PaatettavatOikeudetError,
  PaatettavatOikeudetInfo,
  VarasijoillaOlevatPaatettavatOikeudet,
} from './PaatettavatOikeudetInfo';
import type { Hakukohde } from '@/lib/kouta-types';
import { isNonNullish } from 'remeda';

export const getEhdollisestiVastaanottanutInfo = (
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

function paatettavatInfo(
  tulos: HakutoiveenTulos,
  hakutoive: Hakukohde,
  varallaOlevatPaatettavat: Array<HakutoiveenTulos>,
  hakemus: Hakemus,
): React.ReactNode {
  return (
    <PaatettavatOikeudetInfo
      oikeudet={tulos.paatettavatOpiskeluOikeudet}
      hakutoive={hakutoive}
      varaSijojenOikeudetChild={
        varallaOlevatPaatettavat.length > 0 ? (
          <VarasijoillaOlevatPaatettavatOikeudet
            hakemus={hakemus}
            varallaOlevat={varallaOlevatPaatettavat}
          />
        ) : null
      }
    />
  );
}

export const getVastaanottoPaattyyInfo = (
  vastaanottoPaattyy: string,
  kkHaku: boolean,
) => {
  const textKey = kkHaku
    ? 'vastaanotto.info.paattyy'
    : 'vastaanotto.info.2aste-paattyy';
  return (
    <OphTypography>
      <Translation
        keyName={textKey}
        params={{
          vastaanottoPaattyy,
          strong: <strong />,
        }}
      />
    </OphTypography>
  );
};

const getInfoText = (
  t: TFnType<DefaultParamType, string, TranslationKey>,
  lang: Language,
  tulos: HakutoiveenTulos,
  hakemus: Hakemus,
  hakutoive: Hakukohde,
) => {
  const config = useConfig();
  const hakukohde = hakemus.hakukohteet?.find(
    (hk) => hk.oid === tulos.hakukohdeOid,
  );
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    tulos.vastaanottoDeadline,
    lang,
  );

  const kkHaku = isKorkeakouluHaku(hakemus.haku);

  const yksiAlempiVastaanotto =
    hakukohde &&
    isToisenAsteenYhteisHaku(hakemus.haku) &&
    getAlemmatVastaanotot(hakukohde, hakemus).length === 1;

  const useampiAlempiVastaanotto =
    hakukohde &&
    isToisenAsteenYhteisHaku(hakemus.haku) &&
    getAlemmatVastaanotot(hakukohde, hakemus).length > 1;

  const YPS = hakukohde && hakukohde.yhdenPaikanSaanto?.voimassa;

  const hakutoiveIdx =
    hakemus.hakukohteet?.findIndex((hk) => hk.oid === tulos.hakukohdeOid) ?? 0;

  const muitaHakutoiveitaVaralla =
    getVarallaOlevatMuutToiveet(hakemus, tulos.hakukohdeOid).length > 0;

  const varallaOlevatPaatettavat =
    muitaHakutoiveitaVaralla && isNonNullish(hakutoive)
      ? getVarallaOlevatYlemmatTuloksetJoissaOnPaatettaviaOpiskeluoikeuksia(
          hakemus,
          hakutoive,
        )
      : [];

  if (tulos.vastaanottotila === VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT) {
    return (
      <MultiInfoContainer>
        {getEhdollisestiVastaanottanutInfo(hakemus, lang)}
        {naytetaankoEhdollisuus(tulos) && getEhdollisuusInfo(tulos, lang, t)}
        {(naytetaankoPeruuntuvatOpiskelupaikat(tulos) ||
          varallaOlevatPaatettavat.length > 0) &&
          paatettavatInfo(tulos, hakutoive, varallaOlevatPaatettavat, hakemus)}
        {naytetaankoYosVirhe(tulos) && <PaatettavatOikeudetError />}
      </MultiInfoContainer>
    );
  } else {
    return (
      <MultiInfoContainer
        data-test-id={`vastaanottoinfo-${tulos.hakukohdeOid}`}
      >
        {hakemus.priorisoidutHakutoiveet && (
          <OphTypography>
            {t('vastaanotto.info.priorisoitu', {
              hakutoiveNro: hakutoiveIdx + 1,
            })}
          </OphTypography>
        )}
        {getVastaanottoPaattyyInfo(vastaanottoPaattyy, kkHaku)}
        {kkHaku && YPS && (
          <OphTypography>
            {t('vastaanotto.info.yhden-paikan-saanto')}
          </OphTypography>
        )}
        {!hakemus.priorisoidutHakutoiveet &&
          YPS &&
          muitaHakutoiveitaVaralla && (
            <OphTypography sx={{ fontWeight: 'bolder' }}>
              {t('tulos.info.hyvaksytty-muut-peruuntuvat')}
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
          <ExternalLinkParagraph
            name={t('vastaanotto.info.ohje-kk')}
            href={`${config.routes.yleiset.konfo}/${lang}/sivu/paikan-vastaanotto-ja-ilmoittautuminen-korkeakouluun`}
            underline={'always'}
          />
        )}
        {naytetaankoEhdollisuus(tulos) && getEhdollisuusInfo(tulos, lang, t)}
        {(naytetaankoPeruuntuvatOpiskelupaikat(tulos) ||
          varallaOlevatPaatettavat.length > 0) &&
          paatettavatInfo(tulos, hakutoive, varallaOlevatPaatettavat, hakemus)}
        {naytetaankoYosVirhe(tulos) && <PaatettavatOikeudetError />}
      </MultiInfoContainer>
    );
  }
};

export function VastaanottoInfo({
  tulos,
  application,
  hakutoive,
}: {
  tulos: HakutoiveenTulos;
  application: Hakemus;
  hakutoive: Hakukohde;
}) {
  const { getLanguage, t } = useTranslations();

  const info = getInfoText(t, getLanguage(), tulos, application, hakutoive);

  return <InfoBox>{info}</InfoBox>;
}
