import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ValintatilaChip } from '../valinnantulos/ValintatilaChip';
import { isDefined, isEmpty } from 'remeda';
import { VastaanottoRadio } from './VastaanottoRadio';
import type { Hakukohde } from '@/lib/kouta-types';
import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Application } from '@/lib/application-types';
import { naytettavatVastaanottoTiedot } from '@/lib/vastaanotto.service';
import { VastaanottoTilaChip } from './VastaanottoTilaChip';
import { VastaanottoEhdollisestaSitovaksi } from './VastaanottoEhdollisestaSitovaksi';
import { VastaanottoInfo } from './VastaanottoInfo';

function VastaanottoBox({
  hakukohde,
  tulos,
  application,
}: {
  hakukohde: Hakukohde;
  tulos: HakutoiveenTulos;
  application: Application;
}) {
  const { translateEntity } = useTranslations();

  return (
    <Box>
      {tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA' &&
        tulos.vastaanottotila === 'KESKEN' && (
          <ValintatilaChip hakutoiveenTulos={tulos} />
        )}
      {tulos.vastaanottotila && tulos.vastaanottotila !== 'KESKEN' && (
        <VastaanottoTilaChip vastaanottoTila={tulos.vastaanottotila} />
      )}
      <OphTypography variant="h5" component="div">
        {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography variant="body1">
        {translateEntity(hakukohde.nimi)}
      </OphTypography>
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
    </Box>
  );
}

export function VastaanottoContainer({
  application,
  hakemuksenTulokset,
}: {
  application: Application;
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
