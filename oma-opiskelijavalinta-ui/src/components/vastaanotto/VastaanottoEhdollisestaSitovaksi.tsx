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
import type { Hakemus } from '@/lib/hakemus-types';
import { useGlobalConfirmationModal } from '../ConfirmationModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../NotificationProvider';
import {
  HAKEMUKSEN_TULOKSET_QUERY_KEY,
  useHakemuksenTulokset,
} from '@/lib/useHakemuksenTulokset';

import { VastaanottoMuutaSitovaksiModalContent } from './VastaanottoMuutaSitovaksiModalContent';
import {
  VastaanottoTilaToiminto,
  type HakutoiveenTulos,
} from '@/lib/valinta-tulos-types';
import {
  getVarallaOlevatYlemmatToiveet,
  getVastaanottoVirheAvain,
  VastaanottoOption,
  VastaanottoOptionToKaannosAvain,
} from './vastaanotto-utils';

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
  tulos,
}: {
  hakutoive: Hakukohde;
  application: Hakemus;
  tulos: HakutoiveenTulos;
}) {
  const { t } = useTranslations();
  const { showConfirmation, hideConfirmation } = useGlobalConfirmationModal();
  const [checked, setChecked] = useState<boolean>(false);
  const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

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
        application.haku?.oid ?? '',
        VastaanottoOptionToKaannosAvain[VastaanottoOption.VASTAANOTA_SITOVASTI],
      );
      hideConfirmation();
    },
    onSuccess: () => {
      showNotification({
        message: t('vastaanotto.modaali.muuta-sitovaksi.onnistui'),
        type: 'success',
      });
    },
    onError: (error) => {
      console.error(error);
      showNotification({
        message: t(getVastaanottoVirheAvain(error)),
        type: 'error',
        duration: null,
      });
    },
    // Vastaanotto on voinut tallentua, vaikka vastaus epäonnistuisi (esim. aikakatkaisu),
    // joten tulokset haetaan aina uudelleen, ettei vastaanottoa yritetä turhaan uudestaan.
    onSettled: () => {
      refetchTulokset();
      queryClient.invalidateQueries({
        queryKey: [HAKEMUKSEN_TULOKSET_QUERY_KEY],
      });
    },
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
          ylemmatToiveet={getVarallaOlevatYlemmatToiveet(
            application,
            hakutoive,
          )}
          tulos={tulos}
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
