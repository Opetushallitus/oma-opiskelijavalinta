import { useTranslations } from '@/hooks/useTranslations';
import type { Hakemus } from '@/lib/hakemus-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import {
  isHyvaksyttyOdottaaYlempaa,
  isJulkaistuHakutoiveenTulos,
} from '@/lib/valinta-tulos-utils';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { Hakutoive } from './Hakutoive';

export function HakukohteetContainer({
  application,
  hakemuksenTulokset,
}: {
  application: Hakemus;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
}) {
  const { t } = useTranslations();

  const isJulkaistuTulosHakemuksella =
    isJulkaistuHakutoiveenTulos(hakemuksenTulokset);

  const hakuaikaKaynnissa = application.haku?.hakuaikaKaynnissa;

  return (
    <>
      <OphTypography variant="h4" sx={{ fontWeight: 'normal', mt: 3 }}>
        {hakemuksenTulokset?.length || !hakuaikaKaynnissa
          ? t('hakemukset.valintatilanne')
          : t('hakemukset.hakutoiveet')}
      </OphTypography>
      <Box
        sx={{ width: '100%' }}
        data-test-id={`application-hakutoiveet-${application.oid}`}
      >
        {(application.hakukohteet ?? []).map((hk, idx) => {
          const tulos = hakemuksenTulokset.find(
            (ht) => ht.hakukohdeOid === hk.oid,
          );
          const hyvaksyttyOdottaa =
            tulos &&
            application.priorisoidutHakutoiveet &&
            isHyvaksyttyOdottaaYlempaa(
              application.hakukohteet ?? [],
              hakemuksenTulokset,
              tulos,
              idx,
            );
          return (
            <Hakutoive
              key={hk.oid}
              hakukohde={hk}
              prioriteetti={idx + 1}
              priorisoidutHakutoiveet={application.priorisoidutHakutoiveet}
              sijoitteluKaytossa={application.sijoitteluKaytossa}
              naytaKeskenTulos={
                isJulkaistuTulosHakemuksella || !hakuaikaKaynnissa
              }
              tulos={tulos}
              odottaaYlempaa={hyvaksyttyOdottaa}
            />
          );
        })}
      </Box>
    </>
  );
}
