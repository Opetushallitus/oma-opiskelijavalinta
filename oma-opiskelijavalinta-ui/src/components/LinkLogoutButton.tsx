import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useConfig } from '@/configuration';
import { useTranslations } from '@/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useAuth } from '@/components/authentication/AuthProvider';

function useLinkLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const conf = useConfig();
  const { dispatch } = useAuth();

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
      // Update auth state
      dispatch({ type: 'LOGOUT' });
      // Navigate to logged-out page
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
      loading={logoutMutation.isPending}
    >
      {t('yleinen.logout')}
    </OphButton>
  );
}
