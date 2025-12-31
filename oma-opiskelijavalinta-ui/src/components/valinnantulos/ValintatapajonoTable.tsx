import { useTranslations } from '@/hooks/useTranslations';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { JonokohtainenTulostieto } from '@/lib/valinta-tulos-types';

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
            <TableRow key={jonotulos.valintatapajonoPrioriteetti}>
              <TableCell>
                {jonotulos.nimi ?? t('tulos.valintatapajono')}
              </TableCell>
              <TableCell>{jonotulos.pisteet ?? '-'}</TableCell>
              <TableCell>{jonotulos.alinHyvaksyttyPistemaara ?? '-'}</TableCell>
              <TableCell>{jonotulos.valintatila}</TableCell>
              {/*TODO badge*/}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
