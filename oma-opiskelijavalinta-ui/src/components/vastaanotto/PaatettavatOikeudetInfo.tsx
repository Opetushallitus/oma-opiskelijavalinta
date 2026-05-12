import { OphTypography } from '@opetushallitus/oph-design-system';
import type { PaatettavaOpiskeluOikeus } from '@/lib/valinta-tulos-types';
import { useTranslations } from '@/hooks/useTranslations';
import { BulletedList, BulletItem } from '../BulletedList';

export function PaatettavatOikeudetInfo({
  oikeudet,
}: {
  oikeudet: Array<PaatettavaOpiskeluOikeus>;
}) {
  const { t, translateEntity } = useTranslations();

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
      </BulletedList>
    </>
  );
}
