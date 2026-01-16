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
import type { Hakukohde } from '@/lib/kouta-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { useGlobalConfirmationModal } from '../ConfirmationModal';
import { VastaanottoModalContent } from './VastaanottoModalContent';
import { useMutation } from '@tanstack/react-query';
import { useNotifications } from '../NotificationProvider';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import type { DefaultParamType, TFnType, TranslationKey } from '@tolgee/react';
import {
  getAlemmatVastaanotot,
  hasAlemmatVastaanotot,
  VastaanottoModalParams,
  VastaanottoOption,
  VastaanottoOptionToToiminto,
} from './vastaanotto-utils';
import { isKorkeakouluHaku, isToisenAsteenYhteisHaku } from '@/lib/kouta-utils';
import { VastaanottoPeruAiemmatModalContent } from './VastaanottoPeruAlemmatModalContent';

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

const PERU_OPTION = {
  label: 'vastaanotto.vaihtoehdot.peru',
  value: 'PERU',
};

const VASTAANOTTO_OPTION = {
  label: 'vastaanotto.vaihtoehdot.vastaanota',
  value: 'VASTAANOTA_SITOVASTI',
};

const defaultVastaanottoOptions = [VASTAANOTTO_OPTION, PERU_OPTION];

const vastaanottoOptionsPeruAlemmat = [
  VASTAANOTTO_OPTION,
  {
    label: 'vastaanotto.vaihtoehdot.vastaanota-peru-alemmat',
    value: 'VASTAANOTA_SITOVASTI_PERU_ALEMMAT',
  },
  PERU_OPTION,
];

const vastaanottoOptionsPeruAlempi = [
  VASTAANOTTO_OPTION,
  {
    label: 'vastaanotto.vaihtoehdot.vastaanota-peru-alempi',
    value: 'VASTAANOTA_SITOVASTI_PERU_ALEMMAT',
  },
  PERU_OPTION,
];

const vastaanottoOptionsKK = [
  {
    label: 'vastaanotto.vaihtoehdot.sitova',
    value: 'VASTAANOTA_SITOVASTI_KK',
  },
  PERU_OPTION,
];

const vastaanottoOptionsWithHigherPriorityWaitingOption = [
  {
    label: 'vastaanotto.vaihtoehdot.ehdollinen',
    value: 'VASTAANOTA_EHDOLLISESTI_KK',
  },
  {
    label: 'vastaanotto.vaihtoehdot.sitova-ei-jonotusta',
    value: 'VASTAANOTA_SITOVASTI_JONOTTAMATTA_KK',
  },
  PERU_OPTION,
];

function getKKPriorityOptions(application: Hakemus, hakukohde: Hakukohde) {
  const vastaanotettavissaEhdollisesti =
    application.hakemuksenTulokset.find(
      (ht) => ht.hakukohdeOid === hakukohde.oid,
    )?.vastaanotettavuustila === 'VASTAANOTETTAVISSA_EHDOLLISESTI';
  if (vastaanotettavissaEhdollisesti) {
    return vastaanottoOptionsWithHigherPriorityWaitingOption;
  }
  return defaultVastaanottoOptions;
}

function determineVastaanottoOptions(
  t: TFnType<DefaultParamType, string, TranslationKey>,
  application: Hakemus,
  hakukohde: Hakukohde,
): Array<{ label: string; value: string }> {
  let options = defaultVastaanottoOptions;
  if (
    application.priorisoidutHakutoiveet &&
    application.haku &&
    isKorkeakouluHaku(application.haku)
  ) {
    options = getKKPriorityOptions(application, hakukohde);
  } else if (application.haku && isKorkeakouluHaku(application.haku)) {
    options = vastaanottoOptionsKK;
  } else if (
    application.priorisoidutHakutoiveet &&
    application.haku &&
    isToisenAsteenYhteisHaku(application.haku) &&
    hasAlemmatVastaanotot(hakukohde, application)
  ) {
    options =
      getAlemmatVastaanotot(hakukohde, application).length > 1
        ? vastaanottoOptionsPeruAlemmat
        : vastaanottoOptionsPeruAlempi;
  }
  return options.map((o) => ({ label: t(o.label), value: o.value }));
}

export function VastaanottoRadio({
  hakutoive,
  application,
}: {
  hakutoive: Hakukohde;
  application: Hakemus;
}) {
  const { t } = useTranslations();
  const { showConfirmation, hideConfirmation } = useGlobalConfirmationModal();
  const [selectedVastaanotto, setSelectedVastaanotto] = useState<string>('');
  const [showSelectionError, setShowSelectionError] = useState<boolean>(false);
  const { showNotification } = useNotifications();

  const vastaanottoOptions = determineVastaanottoOptions(
    t,
    application,
    hakutoive,
  );

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
        VastaanottoOptionToToiminto[selectedVastaanotto as VastaanottoOption],
      );
      hideConfirmation();
    },
    onSuccess: () => {
      showNotification({
        message: t(
          VastaanottoModalParams[selectedVastaanotto as VastaanottoOption]
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
      VastaanottoModalParams[selectedVastaanotto as VastaanottoOption];

    showConfirmation({
      ...modalParams,
      mutation,
      content: modalParams.useVastaanottoPeruAiemmatModal ? (
        <VastaanottoPeruAiemmatModalContent
          hakutoive={hakutoive}
          alemmatToiveet={getAlemmatVastaanotot(hakutoive, application)}
        />
      ) : (
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
