import { useTranslations } from '@/hooks/useTranslations';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  type JonokohtainenTulostieto,
  Valintatila,
} from '@/lib/valinta-tulos-types';
import { BadgeColorKey, StatusBadgeChip } from '@/components/StatusBadgeChip';
import {
  getValintatapajononTilaLabel,
  isHyvaksyttyTaiVaralla,
  valintatilaColors,
} from '@/components/valinnantulos/tulos-display-utils';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { ophColors } from '@/lib/theme';
import { mapKeys } from 'remeda';

function JonoStatus({ jonotulos }: { jonotulos: JonokohtainenTulostieto }) {
  const { t, translateEntity } = useTranslations();
  const label = getValintatapajononTilaLabel(jonotulos);
  const tilanKuvaukset = jonotulos.tilanKuvaukset
    ? mapKeys(jonotulos.tilanKuvaukset, (key) => key.toLowerCase())
    : undefined;
  if (isHyvaksyttyTaiVaralla(jonotulos.valintatila)) {
    return (
      <StatusBadgeChip
        badgeProps={{
          label: t(label),
          color: valintatilaColors[jonotulos.valintatila],
        }}
      />
    );
  }
  if (jonotulos.valintatila === Valintatila.HYLATTY) {
    return (
      <>
        <OphTypography variant="body2">{t(label)}</OphTypography>
        {tilanKuvaukset && (
          <OphTypography
            variant="body1"
            sx={{ color: ophColors.grey600, fontSize: '0.875rem' }}
          >
            {translateEntity(tilanKuvaukset)}
          </OphTypography>
        )}
      </>
    );
  }
  if (jonotulos.valintatila === Valintatila.PERUUNTUNUT) {
    return `${t(label)} - ${translateEntity(tilanKuvaukset)}`;
  }
  return t(label);
}

export function ValintatapajonoTable({
  jonokohtaisetTulostiedot,
}: {
  jonokohtaisetTulostiedot: Array<JonokohtainenTulostieto>;
}) {
  const { t } = useTranslations();
  return (
    <TableContainer sx={{ mt: 2 }}>
      <Table
        size="small"
        aria-label={t('tulos.valintatapajonon-tiedot')}
        sx={{
          '& td, & th': {
            borderBottom: '2px solid',
            borderColor: 'divider',
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Valintatapa</TableCell>
            <TableCell>Pisteesi</TableCell>
            <TableCell>Alimmat hyväksytyt pisteet</TableCell>
            <TableCell>Valinnan tulos</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jonokohtaisetTulostiedot.map((jonotulos) => (
            <TableRow
              key={jonotulos.valintatapajonoPrioriteetti}
              data-test-id={`valintatapajono-${jonotulos.nimi}`}
            >
              <TableCell>
                {jonotulos.nimi ?? t('tulos.valintatapajono')}
              </TableCell>
              <TableCell
                data-test-id={`valintatapajono-${jonotulos.nimi}-pisteet`}
              >
                {jonotulos.pisteet ?? '-'}
              </TableCell>
              <TableCell
                data-test-id={`valintatapajono-${jonotulos.nimi}-alinhyvaksytty`}
              >
                {jonotulos.alinHyvaksyttyPistemaara ?? '-'}
              </TableCell>
              <TableCell>
                <JonoStatus jonotulos={jonotulos} />
                {jonotulos.ehdollisestiHyvaksyttavissa && (
                  <StatusBadgeChip
                    badgeProps={{
                      label: t('hakutoive.tila.ehdollisesti-hyvaksytty'),
                      color: BadgeColorKey.Yellow,
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
