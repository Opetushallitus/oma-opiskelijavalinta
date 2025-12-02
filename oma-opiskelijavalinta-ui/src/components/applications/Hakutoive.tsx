import { Box } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import {
  type Application,
  type Hakukohde,
  type HakutoiveenTulos,
} from '@/lib/application.service';
import { ExternalLink } from '../ExternalLink';
import { useConfig } from '@/configuration';
import { ValintatilaChip } from '@/components/applications/ValintatilaChip';
import { doVastaanotto } from '@/lib/vastaanotto.service';

const HakutoiveContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  columnGap: theme.spacing(2),
  borderTop: '1px solid',
  padding: `${theme.spacing(2)} 0 ${theme.spacing(3.5)}`,
  borderColor: ophColors.grey100,
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  '&:last-child': {
    paddingBottom: theme.spacing(1),
  },
}));

const OrderNumberBox = styled(Box)(({ theme }) => ({
  color: ophColors.white,
  backgroundColor: ophColors.grey400,
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.4)}`,
}));

const ValintaperusteetLinkContainer = styled(Box)(({ theme }) => ({
  padding: `${theme.spacing(1.5)} 0 0 0`,
}));

function formValintaperusteetHref(baseHref: string, hakukohdeOid: string) {
  return `${baseHref}/hakukohde/${hakukohdeOid}/valintaperuste`;
}

export function Hakutoive({
  hakukohde,
  application,
  prioriteetti,
  pastApplication = false,
  priorisoidutHakutoiveet = false,
  tulos,
}: {
  hakukohde: Hakukohde;
  application: Application;
  prioriteetti?: number;
  pastApplication?: boolean;
  priorisoidutHakutoiveet?: boolean;
  tulos?: HakutoiveenTulos;
}) {
  const config = useConfig();
  const { translateEntity, t } = useTranslations();

  const valintaperusteetHref = formValintaperusteetHref(
    config.routes.yleiset.konfo,
    hakukohde.oid,
  );

  return (
    <HakutoiveContainer>
      {priorisoidutHakutoiveet && (
        <OrderNumberBox>{prioriteetti}</OrderNumberBox>
      )}
      <Box>
        {tulos && <ValintatilaChip hakutoiveenTulos={tulos} />}
        <OphTypography variant="h5">
          {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
        </OphTypography>
        <OphTypography variant="body1">
          {translateEntity(hakukohde.nimi)}
        </OphTypography>
        {!pastApplication && (
          <ValintaperusteetLinkContainer>
            <ExternalLink
              name={t('hakutoiveet.valintaperusteet')}
              href={valintaperusteetHref}
            />
          </ValintaperusteetLinkContainer>
        )}
        <OphButton
          onClick={() => doVastaanotto(application.oid, hakukohde.oid)}
        >
          Testing vastaanotto
        </OphButton>
      </Box>
    </HakutoiveContainer>
  );
}
