import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';
import { doVastaanotto } from '@/lib/vastaanotto.service';
import { HAKEMUKSEN_TULOKSET_QUERY_KEY } from '@/lib/useHakemuksenTulokset';
import type { Hakemus } from '@/lib/hakemus-types';
import type { VastaanottoTilaToiminto } from '@/lib/valinta-tulos-types';
import { useGlobalConfirmationModal } from '../ConfirmationModal';
import { useNotifications } from '../NotificationProvider';
import { getVastaanottoVirheAvain } from './vastaanotto-utils';

export function useVastaanottoMutation({
  hakemus,
  hakukohdeOid,
  toiminto,
  kaannosAvain,
  successMessage,
}: {
  hakemus: Hakemus;
  hakukohdeOid: string;
  toiminto: VastaanottoTilaToiminto;
  kaannosAvain: string;
  successMessage: string;
}) {
  const { t } = useTranslations();
  const { hideConfirmation } = useGlobalConfirmationModal();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await doVastaanotto(
        hakemus.oid,
        hakukohdeOid,
        toiminto,
        hakemus.haku?.oid ?? '',
        kaannosAvain,
      );
      hideConfirmation();
    },
    onSuccess: () => {
      showNotification({ message: t(successMessage), type: 'success' });
    },
    onError: (error) => {
      console.error(error);
      showNotification({
        message: t(getVastaanottoVirheAvain(error)),
        type: 'error',
        duration: null,
      });
    },
    // Vastaanotto on voinut tallentua, vaikka vastaus olisi virhe,
    // joten tulokset haetaan aina uudelleen, ettei vastaanottoa yritetä turhaan uudestaan.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [HAKEMUKSEN_TULOKSET_QUERY_KEY],
      }),
  });
}
