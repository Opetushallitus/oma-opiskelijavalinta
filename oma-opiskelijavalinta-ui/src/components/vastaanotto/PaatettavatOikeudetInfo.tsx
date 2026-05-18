import { OphTypography } from '@opetushallitus/oph-design-system';
import type { PaatettavaOpiskeluOikeus } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { BulletedList, BulletItem } from '../BulletedList';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';

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
  showLink = true,
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
  showLink?: boolean;
}) {
  const { t } = useTranslations();

  const config = useConfig();

  const yosHref = `${config.routes.yleiset.konfo}`;

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
      {showLink && (
        <ExternalLink href={yosHref} name={t('vastaanotto.yos.linkki')} />
      )}
    </MultiInfoContainer>
  );
}
