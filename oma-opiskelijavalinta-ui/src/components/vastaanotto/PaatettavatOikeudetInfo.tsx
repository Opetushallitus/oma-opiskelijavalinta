import { OphTypography } from '@opetushallitus/oph-design-system';
import type { PaatettavaOpiskeluOikeus } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { BulletedList, BulletItem } from '../BulletedList';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';
import type { Hakukohde } from '@/lib/kouta-types';
import { isNullish } from 'remeda';
import { isDateInPast } from '@/lib/time-utils';
import {
  DEFAULT_DATE_FORMAT,
  toFormattedDateTimeString,
} from '@/lib/localization/translation-utils';

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

export function PaatettavatOikeudetInfo({
  oikeudet,
  hakutoive,
  showLink = true,
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
  hakutoive: Hakukohde;
  showLink?: boolean;
}) {
  const { t } = useTranslations();

  const config = useConfig();

  const yosHref = `${config.routes.yleiset.konfo}`;

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
      <OphTypography>{t('vastaanotto.yos.kuvaus')}</OphTypography>
      <BulletedList>
        {oikeudet.map((oikeus) => (
          <PaatettavaOikeusInfo
            key={`paatettava-oikeus-${oikeus.organisaatioOid ?? oikeus.tunniste}`}
            oikeus={oikeus}
          />
        ))}
      </BulletedList>
      <OphTypography>{dateInfo}</OphTypography>
      {showLink && (
        <ExternalLink href={yosHref} name={t('vastaanotto.yos.linkki')} />
      )}
    </MultiInfoContainer>
  );
}
