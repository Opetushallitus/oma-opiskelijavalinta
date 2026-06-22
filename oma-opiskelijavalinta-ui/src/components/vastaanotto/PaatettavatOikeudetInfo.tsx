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
import { isDefined, isNullish } from 'remeda';
import { isDateInPast } from '@/lib/time-utils';
import {
  DEFAULT_DATE_FORMAT,
  toFormattedDateTimeString,
} from '@/lib/localization/translation-utils';
import type { Language } from '@/lib/localization/localization-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { getSitovastiVastaanotettu } from '../valinnantulos/valinnan-tulos-utils';

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
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
  hakutoive: Hakukohde;
  kuvausSyyAvain?: string;
  showLink?: boolean;
}) {
  const { t } = useTranslations();

  const dateInfo =
    isNullish(hakutoive.koulutuksenAlkamisPvm) ||
    isDateInPast(hakutoive.koulutuksenAlkamisPvm)
      ? t('vastaanotto.yos.paattyy-ei-pvm')
      : t('vastaanotto.yos.paattyy', {
          paattymisAika: toFormattedDateTimeString(
            hakutoive.koulutuksenAlkamisPvm,
            DEFAULT_DATE_FORMAT,
          ),
        });

  return (
    <MultiInfoContainer>
      <OphTypography variant="h5">{t('vastaanotto.yos.otsikko')}</OphTypography>
      <OphTypography>{t(kuvausSyyAvain)}</OphTypography>
      <BulletedList>
        {oikeudet.map((oikeus) => (
          <PaatettavaOikeusInfo
            key={`paatettava-oikeus-${oikeus.organisaatioOid ?? oikeus.tunniste}`}
            oikeus={oikeus}
          />
        ))}
      </BulletedList>
      <OphTypography>{dateInfo}</OphTypography>
      {showLink && <PaatettavaOikeusInfoLink />}
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
  const vastaanotettuTulos = getSitovastiVastaanotettu(tulokset);
  const hakutoive = hakemus.hakukohteet?.find(
    (ht) => ht.oid === vastaanotettuTulos?.hakukohdeOid,
  );

  const kuvausSyyAvain = vastaanotettuTulos?.ehdollisestiHyvaksyttavissa
    ? 'vastaanotto.yos.kuvaus-vastaanotettu-ehdollinen'
    : 'vastaanotto.yos.kuvaus-vastaanotettu';

  return isDefined(vastaanotettuTulos) &&
    isDefined(hakutoive) &&
    vastaanotettuTulos.naytetytPaatettavatOpiskeluoikeudet.length > 0 ? (
    <PaatettavatOikeudetInfo
      oikeudet={vastaanotettuTulos.naytetytPaatettavatOpiskeluoikeudet}
      hakutoive={hakutoive}
      kuvausSyyAvain={kuvausSyyAvain}
    />
  ) : null;
}
