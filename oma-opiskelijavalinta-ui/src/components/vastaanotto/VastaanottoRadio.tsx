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
import { useMutation } from '@tanstack/react-query';
import { useNotifications } from '../NotificationProvider';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';

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
  const { showConfirmation, hideConfirmation } = useGlobalConfirmationModal();
  const [selectedVastaanotto, setSelectedVastaanotto] = useState<string>('');
  const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
  const { showNotification } = useNotifications();

  if (!application.haku) {
    console.error('Haku must be defined for vastaanotto!');
    return;
  }
  const { refetchTulokset } = useHakemuksenTulokset(
    application,
    application.haku,
  );

  const mutation = useMutation({
    mutationFn: async () => {
      await doVastaanotto(
        application.oid,
        hakutoive.oid,
        selectedVastaanotto as VastaanottoTilaToiminto,
      );
      hideConfirmation();
    },
    onSuccess: () => {
      showNotification({
        message: t(
          VastaanottoModalParams[selectedVastaanotto as VastaanottoTilaToiminto]
            .successMessage,
        ),
        type: 'success',
      });
      refetchTulokset();
    },
    onError: () =>
      showNotification({
        message: t('vastaanotto.virhe'),
        type: 'error',
        duration: null,
      }),
  });
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
      mutation,
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
