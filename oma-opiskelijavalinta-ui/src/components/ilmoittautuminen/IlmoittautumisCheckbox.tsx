import { Box } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { useState } from 'react';
import { styled } from '@/lib/theme';
import type { Hakemus } from '@/lib/hakemus-types';
import { useGlobalConfirmationModal } from '../ConfirmationModal';
import { useNotifications } from '../NotificationProvider';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import { useMutation } from '@tanstack/react-query';
import { IlmoittautuminenModalContent } from './IlmoittautuminenModalContent';
import type { Hakukohde } from '@/lib/kouta-types';
import { doIlmoittautuminen } from '@/lib/vastaanotto.service';

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

export function IlmoittautumisCheckbox({
  hakutoive,
  application,
}: {
  application: Hakemus;
  hakutoive: Hakukohde;
}) {
  const { t } = useTranslations();
  const { showConfirmation, hideConfirmation } = useGlobalConfirmationModal();
  const [checked, setChecked] = useState<boolean>(false);
  const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
  const { showNotification } = useNotifications();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!application.haku) {
        console.error('Hakemukselle ei löydy hakua!');
        return;
      }
      await doIlmoittautuminen(
        application.oid,
        hakutoive.oid,
        application.haku?.oid,
      );
      hideConfirmation();
    },
    onSuccess: () => {
      showNotification({
        message: t('ilmoittautuminen.onnistui'),
        type: 'success',
      });
      refetchTulokset();
    },
    onError: () =>
      showNotification({
        message: t('ilmoittautuminen.virhe'),
        type: 'error',
        duration: null,
      }),
  });

  if (!application.haku) {
    console.error('Haku must be defined for ilmoittautuminen!');
    return;
  }

  const { refetchTulokset } = useHakemuksenTulokset(
    application,
    application.haku,
  );

  const sendIlmoittautuminen = () => {
    if (!checked) {
      setShowSelectionError(true);
      return;
    }

    showConfirmation({
      title: 'ilmoittautuminen.modaali.otsikko',
      confirmLabel: 'ilmoittautuminen.modaali.vahvista',
      mutation,
      content: <IlmoittautuminenModalContent hakutoive={hakutoive} />,
    });
  };

  const setIlmoittautuminenChecked = () => {
    setChecked(!checked);
    setShowSelectionError(checked);
  };

  return (
    <InputContainer>
      <OphFormFieldWrapper
        error={showSelectionError}
        errorMessage={showSelectionError ? t('virhe.pakollinen') : ''}
        required={true}
        renderInput={() => (
          <OphCheckbox
            label={t('ilmoittautuminen.lasna')}
            error={showSelectionError}
            onChange={setIlmoittautuminenChecked}
            checked={checked}
          />
        )}
      />
      <OphButton variant="contained" onClick={sendIlmoittautuminen}>
        {t('ilmoittautuminen.laheta')}
      </OphButton>
    </InputContainer>
  );
}
