import { useTranslations } from '@/hooks/useTranslations';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { notDesktop } from '@/lib/theme';
import {
  type JonokohtainenTulostieto,
  Valintatila,
} from '@/lib/valinta-tulos-types';
import { BadgeColorKey, StatusBadgeChip } from '@/components/StatusBadgeChip';
import {
  getValintatapajononTilaLabel,
  isHyvaksyttyTaiVaralla,
  valintatilaColors,
} from '@/components/valinnantulos/valinnan-tulos-utils';
import { ophColors } from '@/lib/theme';
import { mapKeys } from 'remeda';
import { OphTypography } from '@opetushallitus/oph-design-system';

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
      <Box>
        <Box sx={{ whiteSpace: 'nowrap' }}>{t(label)}</Box>
        {tilanKuvaukset && (
          <Box sx={{ color: ophColors.grey600, mt: '4px' }}>
            {translateEntity(tilanKuvaukset)}
          </Box>
        )}
      </Box>
    );
  }
  if (jonotulos.valintatila === Valintatila.PERUUNTUNUT) {
    return `${t(label)} - ${translateEntity(tilanKuvaukset)}`;
  }
  return t(label);
}

export function ValintatapajonoInfo({
  jonokohtaisetTulostiedot,
}: {
  jonokohtaisetTulostiedot: Array<JonokohtainenTulostieto>;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(notDesktop(theme));

  return isMobile ? (
    <ValintatapajonoMobile
      jonokohtaisetTulostiedot={jonokohtaisetTulostiedot}
    />
  ) : (
    <ValintatapajonoTable jonokohtaisetTulostiedot={jonokohtaisetTulostiedot} />
  );
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
          '& td': {
            borderTop: '1px solid',
            borderColor: 'divider',
            borderBottom: 'none',
            verticalAlign: 'top',
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{t('valintatapa.nimi')}</TableCell>
            <TableCell>{t('valintatapa.pisteet')}</TableCell>
            <TableCell>{t('valintatapa.alimmat-hyvaksytyt-pisteet')}</TableCell>
            <TableCell>{t('valintatapa.tulos')}</TableCell>
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
                    sx={{ ml: 0.5 }}
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

function ValintatapajonoMobile({
  jonokohtaisetTulostiedot,
}: {
  jonokohtaisetTulostiedot: Array<JonokohtainenTulostieto>;
}) {
  const { t } = useTranslations();

  return (
    <Stack spacing={2} data-test-id="valintatapajono-mobile">
      {jonokohtaisetTulostiedot.map((jonotulos, index) => (
        <Box
          key={jonotulos.valintatapajonoPrioriteetti}
          sx={{
            backgroundColor: index % 2 === 1 ? ophColors.grey50 : 'transparent',
          }}
        >
          <Stack
            spacing={1}
            margin={2}
            data-test-id={`valintatapajono-${jonotulos.oid}`}
          >
            <Box>
              <OphTypography sx={{ fontWeight: 600 }}>
                {t('valintatapa.nimi')}
              </OphTypography>
              <Box>{jonotulos.nimi ?? t('tulos.valintatapajono')}</Box>
            </Box>

            <Box>
              <OphTypography sx={{ fontWeight: 600 }}>
                {t('valintatapa.pisteet')}
              </OphTypography>
              <Box data-test-id={`valintatapajono-${jonotulos.oid}-pisteet`}>
                {jonotulos.pisteet ?? '-'}
              </Box>
            </Box>

            <Box>
              <OphTypography sx={{ fontWeight: 600 }}>
                {t('valintatapa.alimmat-hyvaksytyt-pisteet')}
              </OphTypography>
              <Box
                data-test-id={`valintatapajono-${jonotulos.oid}-alinhyvaksytty`}
              >
                {jonotulos.alinHyvaksyttyPistemaara ?? '-'}
              </Box>
            </Box>

            <Box>
              <OphTypography sx={{ fontWeight: 600 }}>
                {t('valintatapa.tulos')}
              </OphTypography>
              <JonoStatus jonotulos={jonotulos} />
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
