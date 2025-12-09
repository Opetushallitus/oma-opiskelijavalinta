import { Box } from '@mui/material';
import {
  vastaanotettavatHakutoiveet,
  type Application,
  type Hakukohde,
  type HakutoiveenTulos,
} from '@/lib/application.service';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ValintatilaChip } from '../applications/ValintatilaChip';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { isDefined, isEmpty } from 'remeda';
import { T } from '@tolgee/react';
import { VastaanottoRadio } from './VastaanottoRadio';

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
      <ValintatilaChip hakutoiveenTulos={tulos} />
      <OphTypography variant="h5">
        {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
      </OphTypography>
      <OphTypography variant="body1">
        {translateEntity(hakukohde.nimi)}
      </OphTypography>
      <VastaanottoInfo tulos={tulos} />
      <VastaanottoRadio application={application} hakutoive={hakukohde} />
    </Box>
  );
}

export function VastaanottoContainer({
  application,
}: {
  application: Application;
}) {
  const vastaanotettavat = vastaanotettavatHakutoiveet(application);

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
