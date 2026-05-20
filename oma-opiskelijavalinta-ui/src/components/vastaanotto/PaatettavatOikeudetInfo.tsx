import { OphTypography } from '@opetushallitus/oph-design-system';
import type { PaatettavaOpiskeluOikeus } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { BulletedList, BulletItem } from '../BulletedList';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { MultiInfoContainer } from '@/components/MultiInfoContainer';

export function PaatettavatOikeudetInfo({
  oikeudet,
  showLink = true,
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
  showLink?: boolean;
}) {
  const { t, translateEntity } = useTranslations();

  const config = useConfig();

  const yosHref = `${config.routes.yleiset.konfo}`;

  return (
    <MultiInfoContainer>
      <OphTypography variant="h5">{t('vastaanotto.yos.otsikko')}</OphTypography>
      <OphTypography>{t('vastaanotto.yos.kuvaus')}</OphTypography>
      <BulletedList>
        {oikeudet.map((oikeus) => (
          <BulletItem
            key={`paatettava-oikeus-${oikeus.organisaatioOid ?? oikeus.tunniste}`}
          >
            <OphTypography>
              {translateEntity(oikeus.organisaatioNimi)}
            </OphTypography>
            <OphTypography>{translateEntity(oikeus.nimi)}</OphTypography>
          </BulletItem>
        ))}
      </BulletedList>
      {showLink && (
        <ExternalLink href={yosHref} name={t('vastaanotto.yos.linkki')} />
      )}
    </MultiInfoContainer>
  );
}
