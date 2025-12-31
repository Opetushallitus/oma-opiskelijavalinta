import { type HakutoiveenTulos, Valintatila } from '@/lib/valinta-tulos-types';
import { Box } from '@mui/material';
import { ValintatapajonoTable } from '@/components/valinnantulos/ValintatapajonoTable';
import { useTranslations } from '@/hooks/useTranslations';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { mapKeys } from 'remeda';

const valintatilaIlmanJonoaLabels: Record<Valintatila, string> = {
  [Valintatila.HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.HARKINNANVARAISESTI_HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.VARASIJALTA_HYVAKSYTTY]: 'tulos.hyvaksytty',
  [Valintatila.VARALLA]: 'tulos.varalla',
  [Valintatila.HYLATTY]: 'tulos.hylatty',
  [Valintatila.KESKEN]: 'tulos.kesken',
  [Valintatila.PERUUTETTU]: 'tulos.peruutettu',
  [Valintatila.PERUNUT]: 'tulos.perunut',
  [Valintatila.PERUUNTUNUT]: 'tulos.peruuntunut',
};

function ValintatilaIlmanSijoittelua({
  hakutoiveenTulos,
}: {
  hakutoiveenTulos: HakutoiveenTulos;
}) {
  const { t, translateEntity } = useTranslations();
  const tilanKuvaukset = hakutoiveenTulos?.tilanKuvaukset
    ? mapKeys(hakutoiveenTulos.tilanKuvaukset, (key) => key.toLowerCase())
    : undefined;
  // TODO stilisoi refaktoroi ja fiksaa labelit
  return (
    <Box
      sx={{
        mt: 1.5,
        ml: 2,
        fontSize: '0.875rem',
      }}
    >
      <OphTypography variant="body1">
        {t(
          valintatilaIlmanJonoaLabels[
            hakutoiveenTulos.valintatila as Valintatila
          ],
        )}
      </OphTypography>
      {tilanKuvaukset && (
        <OphTypography variant="body1">
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
          ml: 2,
          fontSize: '0.875rem',
        }}
      >
        <ValintatapajonoTable
          jonokohtaisetTulostiedot={hakutoiveenTulos.jonokohtaisetTulostiedot}
        />
      </Box>
    );
  }
  return <ValintatilaIlmanSijoittelua hakutoiveenTulos={hakutoiveenTulos} />;
}
