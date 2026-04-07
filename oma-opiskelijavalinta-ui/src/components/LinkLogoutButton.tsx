import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfig } from '@/configuration';
import { useTranslations } from '@/hooks/useTranslations';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useAuth } from '@/components/authentication/AuthProvider';
import type { Language } from '@/types/ui-types';

const LANG_LOGOUT_PAGE_MAP: Record<Language, string> = {
  fi: 'fi/sivu/uloskirjautuminen',
  sv: 'sv/sivu/utloggningen',
  en: 'en/sivu/logout',
};

function useLinkLogout() {
  const queryClient = useQueryClient();
  const { getLanguage } = useTranslations();
  const conf = useConfig();
  const { dispatch } = useAuth();

  const logoutPage = `${conf.routes.yleiset.konfo}/${LANG_LOGOUT_PAGE_MAP[getLanguage()]}`;

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
      window.document.location = logoutPage;
    },
  });
}

export function LinkLogoutButton() {
  const { t } = useTranslations();
  const logoutMutation = useLinkLogout();

  return (
    <OphButton
      variant="contained"
      onClick={() => logoutMutation.mutate()}
      loading={logoutMutation.isPending}
      sx={{ borderColor: ophColors.white }}
    >
      {t('yleinen.logout')}
    </OphButton>
  );
}
