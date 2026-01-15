import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { Box } from '@mui/material';
import { ValintatapajonoInfo } from '@/components/valinnantulos/ValintatapajonoTable';
import { useTranslations } from '@/hooks/useTranslations';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { mapKeys } from 'remeda';
import { ophColors } from '@/lib/theme';
import { getValintatilaIlmanSijoitteluaLabel } from '@/components/valinnantulos/tulos-display-utils';

function ValintatilaIlmanSijoittelua({
  hakutoiveenTulos,
}: {
  hakutoiveenTulos: HakutoiveenTulos;
}) {
  const { t, translateEntity } = useTranslations();
  const tilanKuvaukset = hakutoiveenTulos?.tilanKuvaukset
    ? mapKeys(hakutoiveenTulos.tilanKuvaukset, (key) => key.toLowerCase())
    : undefined;
  return (
    <Box
      sx={{ mt: 1.5, ml: 0 }}
      data-test-id={`application-tulos-${hakutoiveenTulos.hakukohdeOid}`}
    >
      <OphTypography
        variant="body1"
        sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
      >
        {t('tulos.ei-sijoittelua')}
      </OphTypography>
      <OphTypography variant="body1" sx={{ fontSize: '0.875rem' }}>
        {getValintatilaIlmanSijoitteluaLabel(hakutoiveenTulos)}
      </OphTypography>
      {tilanKuvaukset && (
        <OphTypography
          variant="body1"
          sx={{ color: ophColors.grey600, fontSize: '0.875rem' }}
        >
          {translateEntity(tilanKuvaukset)}
        </OphTypography>
      )}
    </Box>
  );
}

export function HakutoiveenTulosInfo({
  hakutoiveenTulos,
  sijoitteluKaytossa,
}: {
  hakutoiveenTulos: HakutoiveenTulos;
  sijoitteluKaytossa: boolean;
}) {
  if (sijoitteluKaytossa && hakutoiveenTulos.jonokohtaisetTulostiedot.length) {
    return (
      <Box
        sx={{
          mt: 1.5,
          ml: 0,
          fontSize: '0.875rem',
        }}
      >
        <ValintatapajonoInfo
          jonokohtaisetTulostiedot={hakutoiveenTulos.jonokohtaisetTulostiedot}
        />
      </Box>
    );
  }
  return <ValintatilaIlmanSijoittelua hakutoiveenTulos={hakutoiveenTulos} />;
}
