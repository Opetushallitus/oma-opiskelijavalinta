import { Box } from '@mui/material';
import {
  OphButton,
  OphFormFieldWrapper,
  OphRadioGroup,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isEmptyish } from 'remeda';
import { useState, type ChangeEvent } from 'react';
import { doVastaanotto } from '@/lib/vastaanotto.service';
import { styled } from '@/lib/theme';
import { VastaanottoTilaToiminto } from '@/lib/valinta-tulos-types';
import type { Hakukohde } from '@/lib/kouta-types';
import type { Application } from '@/lib/application-types';
import { useGlobalConfirmationModal } from '../ConfirmationModal';
import {
  VastaanottoModalContent,
  VastaanottoModalParams,
} from './VastaanottoModalContent';

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
  alignItems: 'flex-start',
  margin: `${theme.spacing(2)} 0`,
  '.Mui-error': {
    '.MuiButtonBase-root-MuiSwitchBase-root-MuiRadio-root': {
      color: theme.palette.error,
    },
  },
  '.MuiFormHelperText-root': {
    fontSize: 'medium',
    marginTop: theme.spacing(1),
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
  const { showConfirmation } = useGlobalConfirmationModal();
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
    const modalParams =
      VastaanottoModalParams[selectedVastaanotto as VastaanottoTilaToiminto];

    showConfirmation({
      ...modalParams,
      onConfirm: () =>
        doVastaanotto(
          application.oid,
          hakutoive.oid,
          selectedVastaanotto as VastaanottoTilaToiminto,
        ),
      content: (
        <VastaanottoModalContent
          modalParams={modalParams}
          hakutoive={hakutoive}
        />
      ),
    });
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
