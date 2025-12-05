import { Box } from '@mui/material';
import {
  type Application,
  type Hakukohde,
  type HakutoiveenTulos,
} from '@/lib/application.service';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ValintatilaChip } from './ValintatilaChip';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { isDefined } from 'remeda';
import { T } from '@tolgee/react';

function VastaanottoInfo({ application }: { application: Application }) {
  const { getLanguage } = useTranslations();

  const lang = getLanguage();
  const vastaanottoPaattyy = toFormattedDateTimeStringWithLocale(
    application.vastaanottoPaattyy,
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
      <VastaanottoInfo application={application} />
    </Box>
  );
}

export function VastaanottoContainer({
  application,
}: {
  application: Application;
}) {
  return (
    <Box sx={{ width: '100%' }}>
      {application.hakemuksenTulokset.map((tulos) => {
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
