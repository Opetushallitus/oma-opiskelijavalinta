import { Box } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { ValintatilaChip } from '@/components/valinnantulos/ValintatilaChip';
import type { Hakukohde } from '@/lib/kouta-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { BadgeColorKey, StatusBadgeChip } from '@/components/StatusBadgeChip';
import { HakutoiveenTulosInfo } from '@/components/valinnantulos/HakutoiveenTulosInfo';
import type { Hakemus } from '@/lib/hakemus-types';
import { ValintatilaInfo } from '@/components/valinnantulos/ValintatilaInfo';
import {
  isHyvaksyttyOdottaaYlempaa,
  isHyvaksyttyTaiVaralla,
} from '@/components/valinnantulos/valinnan-tulos-utils';

const ORDER_NUMBER_WIDTH = 40; // px
const HakutoiveContainer = styled(Box)(({ theme }) => ({
  columnGap: theme.spacing(2),
  borderTop: '1px solid',
  padding: `${theme.spacing(2)} 0 ${theme.spacing(3.5)}`,
  borderColor: ophColors.grey100,
  width: '100%',
  '&:last-child': {
    paddingBottom: theme.spacing(1),
  },
}));

const OrderNumberBox = styled(Box)(({ theme }) => ({
  width: ORDER_NUMBER_WIDTH,
  textAlign: 'center',
  color: ophColors.white,
  backgroundColor: ophColors.grey400,
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.4)}`,
  marginRight: theme.spacing(2),
}));

const ValintaperusteetLinkContainer = styled(Box)(({ theme }) => ({
  padding: `${theme.spacing(1.5)} 0 0 0`,
}));

function formValintaperusteetHref(baseHref: string, hakukohdeOid: string) {
  return `${baseHref}/hakukohde/${hakukohdeOid}/valintaperuste`;
}

export function Hakutoive({
  hakemus,
  hakukohde,
  prioriteetti,
  pastApplication = false,
  sijoitteluKaytossa = false,
  naytaKeskenTulos = false,
  tulos,
}: {
  hakemus: Hakemus;
  hakukohde: Hakukohde;
  prioriteetti?: number;
  pastApplication?: boolean;
  sijoitteluKaytossa?: boolean;
  naytaKeskenTulos?: boolean;
  tulos?: HakutoiveenTulos;
}) {
  const config = useConfig();
  const { translateEntity, t } = useTranslations();

  const valintaperusteetHref = formValintaperusteetHref(
    config.routes.yleiset.konfo,
    hakukohde.oid,
  );

  const odottaaYlempaa = Boolean(
    tulos &&
      hakemus.priorisoidutHakutoiveet &&
      isHyvaksyttyOdottaaYlempaa(hakemus, tulos),
  );
  console.log('odottaaYlempaa', odottaaYlempaa);
  return (
    <HakutoiveContainer>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: '10px',
        }}
      >
        {hakemus.priorisoidutHakutoiveet && (
          <OrderNumberBox>{prioriteetti}</OrderNumberBox>
        )}
        <ValintatilaChip
          hakutoiveenTulos={tulos}
          odottaaYlempaa={odottaaYlempaa}
          naytaKeskenTulos={naytaKeskenTulos}
        />
        {tulos?.ehdollisestiHyvaksyttavissa && (
          <StatusBadgeChip
            sx={{ ml: 1 }}
            badgeProps={{
              label: t('hakutoive.tila.ehdollisesti-hyvaksytty'),
              color: BadgeColorKey.Yellow,
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          pl: hakemus.priorisoidutHakutoiveet
            ? `${ORDER_NUMBER_WIDTH + 15}px`
            : 0,
          mt: hakemus.priorisoidutHakutoiveet ? '8px' : '10px',
        }}
      >
        <OphTypography variant="h5">
          {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
        </OphTypography>
        <OphTypography variant="body1">
          {translateEntity(hakukohde.nimi)}
        </OphTypography>
        {tulos && isHyvaksyttyTaiVaralla(tulos.valintatila) && (
          <ValintatilaInfo
            tulos={tulos}
            application={hakemus}
            odottaaYlempaa={odottaaYlempaa}
          />
        )}
        {tulos && (
          <HakutoiveenTulosInfo
            hakutoiveenTulos={tulos}
            sijoitteluKaytossa={sijoitteluKaytossa}
          />
        )}
        {!pastApplication && (
          <ValintaperusteetLinkContainer>
            <ExternalLink
              name={t('hakutoiveet.valintaperusteet')}
              href={valintaperusteetHref}
            />
          </ValintaperusteetLinkContainer>
        )}
      </Box>
    </HakutoiveContainer>
  );
}
