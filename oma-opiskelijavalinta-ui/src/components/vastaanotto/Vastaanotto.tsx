import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ValintatilaChip } from '../applications/ValintatilaChip';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { isDefined, isEmpty } from 'remeda';
import { T } from '@tolgee/react';
import { VastaanottoRadio } from './VastaanottoRadio';
import type { Hakukohde } from '@/lib/kouta-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Application } from '@/lib/application-types';
import { naytettavatVastaanottoTiedot } from '@/lib/vastaanotto.service';
import { VastaanottoTilaChip } from './VastaanottoTilaChip';

function VastaanottoInfo({ tulos }: { tulos: HakutoiveenTulos }) {
  const { getLanguage } = useTranslations();

  const lang = getLanguage();
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    tulos.vastaanottoDeadline,
    lang,
  );

  return (
    <InfoBox>
      <OphTypography>
        <T
          keyName={'vastaanotto.paattyy'}
          params={{
            vastaanottoPaattyy,
            strong: <strong />,
          }}
        />
      </OphTypography>
    </InfoBox>
  );
}

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
      {tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA' && (
        <ValintatilaChip hakutoiveenTulos={tulos} />
      )}
      {tulos.vastaanotettavuustila === 'EI_VASTAANOTETTAVISSA' &&
        tulos.vastaanottotila && (
          <VastaanottoTilaChip vastaanottoTila={tulos.vastaanottotila} />
        )}
      <OphTypography variant="h5">
        {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography variant="body1">
        {translateEntity(hakukohde.nimi)}
      </OphTypography>
      {tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA' && (
        <VastaanottoInfo tulos={tulos} />
      )}
      {tulos.vastaanotettavuustila !== 'EI_VASTAANOTETTAVISSA' && (
        <VastaanottoRadio application={application} hakutoive={hakukohde} />
      )}
    </Box>
  );
}

export function VastaanottoContainer({
  application,
}: {
  application: Application;
}) {
  const vastaanotettavat = naytettavatVastaanottoTiedot(application);

  return isEmpty(vastaanotettavat) ? null : (
    <Box sx={{ width: '100%' }}>
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
