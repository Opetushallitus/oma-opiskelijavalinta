import { Box } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isDefined, isEmpty } from 'remeda';
import { VastaanottoRadio } from './VastaanottoRadio';
import type { Hakukohde } from '@/lib/kouta-types';
import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { naytettavatVastaanottoTiedot } from '@/lib/vastaanotto.service';
import { VastaanottoEhdollisestaSitovaksi } from './VastaanottoEhdollisestaSitovaksi';
import { VastaanottoInfo } from './VastaanottoInfo';
import { IlmoittautuminenContainer } from '../ilmoittautuminen/Ilmoittautuminen';
import { HakutoiveenTilaBadge } from '@/components/valinnantulos/HakutoiveenTilaBadge';
import { styled } from '@/lib/theme';
import { isEhdollisestiHyvaksyttyVastaanottanutSitovasti } from '@/components/valinnantulos/valinnan-tulos-utils';
import { EhdollisuusAlert } from '@/components/valinnantulos/EhdollisuusAlert';

const StyledBox = styled(Box)(({ theme }) => ({
  ':not(:first-of-type)': {
    borderTop: '2px solid',
    borderColor: ophColors.grey100,
    paddingTop: theme.spacing(2),
  },
}));

function VastaanottoBox({
  hakukohde,
  tulos,
  application,
}: {
  hakukohde: Hakukohde;
  tulos: HakutoiveenTulos;
  application: Hakemus;
}) {
  const { translateEntity } = useTranslations();

  return (
    <StyledBox>
      <HakutoiveenTilaBadge hakutoiveenTulos={tulos} />
      <OphTypography variant="h5" component="div">
        {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography variant="body1">
        {translateEntity(hakukohde.nimi)}
      </OphTypography>
      {isEhdollisestiHyvaksyttyVastaanottanutSitovasti(tulos) && (
        <EhdollisuusAlert tulos={tulos} />
      )}
      {tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA' && (
        <VastaanottoInfo tulos={tulos} application={application} />
      )}
      {tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA' &&
        tulos.vastaanottotila !== 'EHDOLLISESTI_VASTAANOTTANUT' && (
          <VastaanottoRadio application={application} hakutoive={hakukohde} />
        )}
      {tulos.vastaanotettavuustila === 'VASTAANOTETTAVISSA_SITOVASTI' &&
        tulos.vastaanottotila === 'EHDOLLISESTI_VASTAANOTTANUT' && (
          <VastaanottoEhdollisestaSitovaksi
            application={application}
            hakutoive={hakukohde}
          />
        )}
      <IlmoittautuminenContainer
        hakemus={application}
        hakemuksenTulos={tulos}
        hakukohde={hakukohde}
      />
    </StyledBox>
  );
}

export function VastaanottoContainer({
  application,
  hakemuksenTulokset,
}: {
  application: Hakemus;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
}) {
  const vastaanotettavat = naytettavatVastaanottoTiedot(hakemuksenTulokset);

  return isEmpty(vastaanotettavat) ? null : (
    <Box sx={{ width: '100%' }} data-test-id={`vastaanotot-${application.oid}`}>
      {vastaanotettavat.map((tulos) => {
        const hakukohde: Hakukohde | undefined = application.hakukohteet?.find(
          (hk) => tulos.hakukohdeOid === hk.oid,
        );

        return isDefined(hakukohde) ? (
          <VastaanottoBox
            hakukohde={hakukohde}
            tulos={tulos}
            application={application}
            key={`hakutoive-vastaanotto-${hakukohde.oid}`}
          />
        ) : null;
      })}
    </Box>
  );
}
