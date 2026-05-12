import { OphTypography } from '@opetushallitus/oph-design-system';
import type { PaatettavaOpiskeluOikeus } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { BulletedList, BulletItem } from '../BulletedList';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';

export function PaatettavatOikeudetInfo({
  oikeudet,
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
}) {
  const { t, translateEntity } = useTranslations();

  const config = useConfig();

  const yosHref = `${config.routes.yleiset.konfo}`;

  return (
    <>
      <OphTypography variant="h5">{t('tulos.yos.otsikko')}</OphTypography>
      <OphTypography>{t('tulos.yos.kuvaus')}</OphTypography>
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
        <ExternalLink href={yosHref} name={t('tulos.yos.linkki')} />
      </BulletedList>
    </>
  );
}
