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
import { StatusBadgeChip } from '@/components/StatusBadgeChip';
import {
  valintatilaColors,
  valintatilaIlmanJonoaLabels,
} from '@/components/valinnantulos/tulos-display-utils';

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
              <TableCell>{jonotulos.pisteet ?? '-'}</TableCell>
              <TableCell>{jonotulos.alinHyvaksyttyPistemaara ?? '-'}</TableCell>
              <TableCell>
                <StatusBadgeChip
                  badgeProps={{
                    label: t(
                      valintatilaIlmanJonoaLabels[
                        jonotulos.valintatila as Valintatila
                      ],
                    ),
                    color:
                      valintatilaColors[jonotulos.valintatila as Valintatila],
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
