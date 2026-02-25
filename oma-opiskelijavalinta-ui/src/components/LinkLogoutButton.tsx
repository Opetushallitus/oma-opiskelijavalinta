import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useConfig } from '@/configuration';
import { useTranslations } from '@/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';

function useLinkLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const conf = useConfig();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(conf.routes.yleiset.linkLogoutApiUrl, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok && response.status !== 401) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.clear();
      sessionStorage.removeItem('isLinkLogin');
      navigate('/logged-out', { replace: true });
    },
  });
}

export function LinkLogoutButton() {
  const { t } = useTranslations();
  const logoutMutation = useLinkLogout();

  return (
    <OphButton
      variant="outlined"
      onClick={() => logoutMutation.mutate()}
      loading={logoutMutation.isPending} // show spinner while logout
    >
      {t('yleinen.logout')}
    </OphButton>
  );
}
