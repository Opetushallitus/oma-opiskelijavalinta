import { OphTypography } from '@opetushallitus/oph-design-system';
import type {
  HakutoiveenTulos,
  PaatettavaOpiskeluOikeus,
} from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { BulletedList, BulletItem } from '../BulletedList';
import { ExternalLinkParagraph } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import type { Hakukohde } from '@/lib/kouta-types';
import { isDefined, isNonNullish, isNullish } from 'remeda';
import { isDateInPast } from '@/lib/time-utils';
import {
  DEFAULT_DATE_FORMAT,
  toFormattedDateTimeString,
} from '@/lib/localization/translation-utils';
import type { Language } from '@/lib/localization/localization-types';
import type { Hakemus } from '@/lib/hakemus-types';
import {
  getEhdollisestiVastaanotettu,
  getSitovastiVastaanotettu,
} from '../valinnantulos/valinnan-tulos-utils';
import { subDays } from 'date-fns';
import { getVarallaOlevatYlemmatTuloksetJoissaOnPaatettaviaOpiskeluoikeuksia } from './vastaanotto-utils';

function PaatettavaOikeusInfo({
  oikeus,
}: {
  oikeus: PaatettavaOpiskeluOikeus;
}) {
  const { translateEntity } = useTranslations();

  const virtaNimi = translateEntity(oikeus.virtaNimi);

  return (
    <BulletItem>
      <OphTypography>{translateEntity(oikeus.organisaatioNimi)}</OphTypography>
      <OphTypography>{translateEntity(oikeus.supaNimi)}</OphTypography>
      {virtaNimi.trim().length > 0 && (
        <OphTypography>{virtaNimi}</OphTypography>
      )}
    </BulletItem>
  );
}

const LangYosLinkMap: Record<Language, string> = {
  fi: '/fi/sivu/yhden-opiskeluoikeuden-saannos',
  sv: '/sv/sivu/bestaemmelsen-om-en-studieraett',
  en: '/en/sivu/the-one-study-right-rule',
} as const;

function PaatettavaOikeusInfoLink() {
  const { t, getLanguage } = useTranslations();

  const config = useConfig();

  const yosHref = `${config.routes.yleiset.konfo}${LangYosLinkMap[getLanguage()]}`;

  return (
    <ExternalLinkParagraph href={yosHref} name={t('vastaanotto.yos.linkki')} />
  );
}

export function PaatettavatOikeudetInfo({
  oikeudet,
  hakutoive,
  showLink = true,
  kuvausSyyAvain = 'vastaanotto.yos.kuvaus',
  varaSijojenOikeudetChild,
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
  hakutoive: Hakukohde;
  kuvausSyyAvain?: string;
  showLink?: boolean;
  varaSijojenOikeudetChild?: React.ReactNode;
}) {
  const { t } = useTranslations();

  const dateInfo =
    isNullish(hakutoive.koulutuksenAlkamisPvm) ||
    isDateInPast(hakutoive.koulutuksenAlkamisPvm)
      ? t('vastaanotto.yos.paattyy-ei-pvm')
      : t('vastaanotto.yos.paattyy', {
          alkamisAika: toFormattedDateTimeString(
            hakutoive.koulutuksenAlkamisPvm,
            DEFAULT_DATE_FORMAT,
          ),
          paattymisAika: toFormattedDateTimeString(
            subDays(hakutoive.koulutuksenAlkamisPvm, 1),
            DEFAULT_DATE_FORMAT,
          ),
        });

  return (
    <MultiInfoContainer>
      {oikeudet.length > 0 && (
        <>
          <OphTypography variant="h5">
            {t('vastaanotto.yos.otsikko')}
          </OphTypography>
          <OphTypography>{t(kuvausSyyAvain)}</OphTypography>
          <BulletedList>
            {oikeudet.map((oikeus) => (
              <PaatettavaOikeusInfo
                key={`paatettava-oikeus-${oikeus.organisaatioOid ?? oikeus.tunniste}`}
                oikeus={oikeus}
              />
            ))}
          </BulletedList>
        </>
      )}
      {isDefined(varaSijojenOikeudetChild) && varaSijojenOikeudetChild}
      <OphTypography>{dateInfo}</OphTypography>
      {showLink && <PaatettavaOikeusInfoLink />}
    </MultiInfoContainer>
  );
}

type HakukohdePaatettavatOikeudet = {
  orderNumber: number;
  hakukohde?: Hakukohde;
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
};

export function VarasijoillaOlevatPaatettavatOikeudet({
  hakemus,
  varallaOlevat,
}: {
  hakemus: Hakemus;
  varallaOlevat: Array<HakutoiveenTulos>;
}) {
  const { t, translateEntity } = useTranslations();

  const hakukohdeOikeudetList: Array<HakukohdePaatettavatOikeudet> =
    varallaOlevat.map((v) => {
      const indexOfHakutoive = hakemus.hakemuksenTulokset.findIndex(
        (ht) => ht.hakukohdeOid === v.hakukohdeOid,
      );
      const hakukohde = hakemus.hakukohteet?.at(indexOfHakutoive);
      if (!hakukohde) {
        console.warn(
          `Ei löydetty ${indexOfHakutoive} hakutoivetta hakemuksen tiedoista!`,
        );
      }
      return {
        orderNumber: indexOfHakutoive + 1,
        hakukohde,
        oikeudet: v.paatettavatOpiskeluOikeudet,
      };
    });

  return (
    <MultiInfoContainer>
      <OphTypography variant="h5">
        {t('vastaanotto.yos.varasijat.otsikko')}
      </OphTypography>
      {hakukohdeOikeudetList.map((ho) => (
        <MultiInfoContainer
          key={`hakutoiveen-varalla-olevien-oikeudet-${ho.orderNumber}`}
        >
          {isDefined(ho.hakukohde) && (
            <OphTypography sx={{ fontWeight: 'bolder' }}>
              {`${t('hakutoive.hakutoive-numerolla', { nro: ho.orderNumber })} ${translateEntity(ho.hakukohde.jarjestyspaikkaHierarkiaNimi)}. ${translateEntity(ho.hakukohde.nimi)}`}
            </OphTypography>
          )}
          <OphTypography>{t('vastaanotto.yos.varasijat.kuvaus')}</OphTypography>
          <BulletedList>
            {ho.oikeudet.map((oikeus) => (
              <PaatettavaOikeusInfo
                key={`paatettava-oikeus-varasija-${oikeus.organisaatioOid ?? oikeus.tunniste}`}
                oikeus={oikeus}
              />
            ))}
          </BulletedList>
        </MultiInfoContainer>
      ))}
    </MultiInfoContainer>
  );
}

export function PaatettavatOikeudetInfoVastaanotetulle({
  hakemus,
  tulokset,
}: {
  hakemus: Hakemus;
  tulokset: Array<HakutoiveenTulos>;
}) {
  let vastaanotettuTulos = getSitovastiVastaanotettu(tulokset);
  const sitovastiVastaanotettu = isNonNullish(vastaanotettuTulos);

  if (isNullish(vastaanotettuTulos)) {
    vastaanotettuTulos = getEhdollisestiVastaanotettu(tulokset);
  }

  const hakutoive = hakemus.hakukohteet?.find(
    (ht) => ht.oid === vastaanotettuTulos?.hakukohdeOid,
  );

  const varallaOlevat =
    !sitovastiVastaanotettu && isNonNullish(hakutoive)
      ? getVarallaOlevatYlemmatTuloksetJoissaOnPaatettaviaOpiskeluoikeuksia(
          hakemus,
          hakutoive,
        )
      : [];

  const kuvausSyyAvain = vastaanotettuTulos?.ehdollisestiHyvaksyttavissa
    ? 'vastaanotto.yos.kuvaus-vastaanotettu-ehdollinen'
    : 'vastaanotto.yos.kuvaus-vastaanotettu';

  return isDefined(vastaanotettuTulos) &&
    isDefined(hakutoive) &&
    (vastaanotettuTulos.naytetytPaatettavatOpiskeluoikeudet.length > 0 ||
      varallaOlevat.length > 0) ? (
    <MultiInfoContainer>
      <PaatettavatOikeudetInfo
        oikeudet={vastaanotettuTulos.naytetytPaatettavatOpiskeluoikeudet}
        hakutoive={hakutoive}
        kuvausSyyAvain={kuvausSyyAvain}
        varaSijojenOikeudetChild={
          varallaOlevat.length > 0 ? (
            <VarasijoillaOlevatPaatettavatOikeudet
              hakemus={hakemus}
              varallaOlevat={varallaOlevat}
            />
          ) : null
        }
      />
    </MultiInfoContainer>
  ) : null;
}
