import { useTranslations } from '@/hooks/useTranslations';
import type { Hakemus } from '@/lib/hakemus-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { Hakutoive } from './Hakutoive';
import { isJulkaistuHakutoiveenTulos } from '@/components/valinnantulos/valinnan-tulos-utils';
import { useAdjustHeaderLevel } from '@/hooks/useAdjustHeaderLevel';
import { ErrorBox } from '@/components/ErrorBox';

export function HakukohteetContainer({
  hakemus,
  hakemuksenTulokset,
  mennytHakemus = false,
  virhe = false,
}: {
  hakemus: Hakemus;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
  mennytHakemus?: boolean;
  virhe?: boolean;
}) {
  const { t } = useTranslations();

  const isJulkaistuTulosHakemuksella =
    isJulkaistuHakutoiveenTulos(hakemuksenTulokset);

  const hakuaikaKaynnissa = hakemus.haku?.hakuaikaKaynnissa;

  const adjustHeaderLevel = useAdjustHeaderLevel();

  return (
    <>
      <OphTypography
        variant="h4"
        component={adjustHeaderLevel ? 'h3' : 'h4'}
        sx={{ fontWeight: 'normal', mt: 3 }}
      >
        {(hakemuksenTulokset?.length || !hakuaikaKaynnissa) && !virhe
          ? t('hakemukset.valintatilanne')
          : t('hakemukset.hakutoiveet')}
      </OphTypography>
      {virhe && (
        <ErrorBox>
          <OphTypography sx={{ fontWeight: 600 }}>
            {t('tulos.virhe.otsikko')}
          </OphTypography>
          <OphTypography>{t('tulos.virhe.kuvaus')}</OphTypography>
        </ErrorBox>
      )}
      <Box
        sx={{ width: '100%' }}
        data-test-id={`application-hakutoiveet-${hakemus.oid}`}
      >
        {(hakemus.hakukohteet ?? []).map((hk, idx) => {
          const tulos = hakemuksenTulokset.find(
            (ht) => ht.hakukohdeOid === hk.oid,
          );
          return (
            <Hakutoive
              hakemus={hakemus}
              key={hk.oid}
              hakukohde={hk}
              prioriteetti={idx + 1}
              sijoitteluKaytossa={hakemus.sijoitteluKaytossa}
              naytaKeskenTulos={
                (isJulkaistuTulosHakemuksella || !hakuaikaKaynnissa) && !virhe
              }
              tulos={tulos}
              mennytHakemus={mennytHakemus}
            />
          );
        })}
      </Box>
    </>
  );
}
