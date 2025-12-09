import { Box } from '@mui/material';
import { type Application, type Hakukohde } from '@/lib/application.service';
import {
  OphButton,
  OphFormFieldWrapper,
  OphRadioGroup,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isEmptyish } from 'remeda';
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

export function VastaanottoRadio({
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
