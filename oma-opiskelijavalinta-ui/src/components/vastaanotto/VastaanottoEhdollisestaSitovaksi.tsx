import { Box } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { useState } from 'react';
import { doVastaanotto } from '@/lib/vastaanotto.service';
import { styled } from '@/lib/theme';
import type { Hakukohde } from '@/lib/kouta-types';
import type { Application } from '@/lib/application-types';
import { useGlobalConfirmationModal } from '../ConfirmationModal';
import { useMutation } from '@tanstack/react-query';
import { useNotifications } from '../NotificationProvider';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';

import { VastaanottoMuutaSitovaksiModalContent } from './VastaanottoMuutaSitovaksiModalContent';
import { VastaanottoTilaToiminto } from '@/lib/valinta-tulos-types';

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

export function VastaanottoEhdollisestaSitovaksi({
  hakutoive,
  application,
}: {
  hakutoive: Hakukohde;
  application: Application;
}) {
  const { t } = useTranslations();
  const { showConfirmation, hideConfirmation } = useGlobalConfirmationModal();
  const [checked, setChecked] = useState<boolean>(false);
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
        VastaanottoTilaToiminto.VASTAANOTA_SITOVASTI,
      );
      hideConfirmation();
    },
    onSuccess: () => {
      showNotification({
        message: t('vastaanotto.modaali.muuta-sitovaksi.onnistui'),
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

  const setSitovaksiChecked = () => {
    setChecked(!checked);
    setShowSelectionError(checked);
  };

  const sendVastaanotto = () => {
    if (!checked) {
      setShowSelectionError(true);
      return;
    }

    showConfirmation({
      title: 'vastaanotto.modaali.muuta-sitovaksi.otsikko',
      confirmLabel: 'vastaanotto.modaali.muuta-sitovaksi.vahvista',
      mutation,
      content: (
        <VastaanottoMuutaSitovaksiModalContent
          hakutoive={hakutoive}
          ylemmatToiveet={[
            hakutoive,
            hakutoive,
            hakutoive,
            hakutoive,
            hakutoive,
          ]}
        />
      ),
    });
  };

  return (
    <InputContainer>
      <OphFormFieldWrapper
        error={showSelectionError}
        errorMessage={showSelectionError ? t('virhe.pakollinen') : ''}
        label={t('vastaanotto.jonotus.otsake')}
        required={true}
        renderInput={() => (
          <OphCheckbox
            label={t('vastaanotto.jonotus.valinta')}
            error={showSelectionError}
            onChange={setSitovaksiChecked}
            checked={checked}
          />
        )}
      />
      <OphButton variant="contained" onClick={sendVastaanotto}>
        {t('vastaanotto.laheta')}
      </OphButton>
    </InputContainer>
  );
}
