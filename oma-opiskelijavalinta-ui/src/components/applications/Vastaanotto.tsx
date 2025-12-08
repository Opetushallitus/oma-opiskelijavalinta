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
import { isDefined, isEmptyish } from 'remeda';
import { T } from '@tolgee/react';
import { useState, type ChangeEvent } from 'react';
import { doVastaanotto, VastaanottoTila } from '@/lib/vastaanotto.service';
import { styled } from '@/lib/theme';

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
  alignItems: 'flex-start',
  margin: `${theme.spacing(2)} 0`,
  '.Mui-error': {
    'MuiButtonBase-root-MuiSwitchBase-root-MuiRadio-root': {
      color: theme.palette.error,
    },
  },
}));

function VastaanottoInput({
  hakutoive,
  application,
}: {
  hakutoive: Hakukohde;
  application: Application;
}) {
  const { t } = useTranslations();
  const [selectedVastaanotto, setSelectedVastaanotto] = useState<string>('');
  const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
  const vastaanottoOptions = [
    {
      label: t('vastaanotto.vaihtoehdot.sitova'),
      value: 'VastaanotaSitovasti',
    },
    {
      label: t('vastaanotto.vaihtoehdot.peru'),
      value: 'Peru',
    },
  ];

  const selectVastaanOtto = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedVastaanotto(event.target.value);
    setShowSelectionError(false);
  };

  const sendVastaanotto = () => {
    if (isEmptyish(selectedVastaanotto)) {
      setShowSelectionError(true);
      return;
    }
    doVastaanotto(
      application.oid,
      hakutoive.oid,
      selectedVastaanotto as VastaanottoTila,
    );
  };

  return (
    <InputContainer>
      <OphFormFieldWrapper
        error={showSelectionError}
        errorMessage={showSelectionError ? t('virhe.pakollinen-yksi') : ''}
        label={t('vastaanotto.vaihtoehdot.otsake')}
        required={true}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            error={showSelectionError}
            onChange={selectVastaanOtto}
            options={vastaanottoOptions}
            labelId={labelId}
            aria-required={true}
          />
        )}
      />
      <OphButton variant="contained" onClick={sendVastaanotto}>
        {t('vastaanotto.laheta')}
      </OphButton>
    </InputContainer>
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
