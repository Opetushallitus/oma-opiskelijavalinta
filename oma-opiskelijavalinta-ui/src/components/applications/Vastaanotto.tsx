import { Box } from '@mui/material';
import {
  type Application,
  type Hakukohde,
  type HakutoiveenTulos,
} from '@/lib/application.service';
import {
  OphButton,
  OphFormFieldWrapper,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { ValintatilaChip } from './ValintatilaChip';
import { InfoBox } from '../InfoBox';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { isDefined } from 'remeda';
import { T } from '@tolgee/react';
import { useState } from 'react';
import { doVastaanotto, VastaanottoTila } from '@/lib/vastaanotto.service';

function VastaanottoInput({
  hakutoive,
  application,
}: {
  hakutoive: Hakukohde;
  application: Application;
}) {
  const [selectedVastaanotto, setSelectedVastaanotto] = useState<string>('');

  const vastaanottoOptions = [
    {
      label: 'Otan tämän opiskelupaikan vastaan sitovasti',
      value: 'VastaanotaSitovasti',
    },
    {
      label: 'En ota tätä opiskelupaikkaa vastaan',
      value: 'Peru',
    },
  ];

  const sendVastaanotto = () => {
    doVastaanotto(
      application.oid,
      hakutoive.oid,
      selectedVastaanotto as VastaanottoTila,
    );
  };

  return (
    <>
      <OphFormFieldWrapper
        label={'Opiskelupaikan vastaanotto'}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            onChange={(event) => setSelectedVastaanotto(event.target.value)}
            options={vastaanottoOptions}
            labelId={labelId}
            aria-required={true}
          />
        )}
      />
      <OphButton onClick={sendVastaanotto}>Lähetä vastaus</OphButton>
    </>
  );
}

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
      <VastaanottoInput application={application} hakutoive={hakukohde} />
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
