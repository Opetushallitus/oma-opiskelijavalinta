import { useAuth } from '@/components/authentication/AuthProvider';
import { isLinkUser } from '@/lib/auth/auth-util';

export const useAdjustHeaderLevel = () => {
  const { state } = useAuth();

  const isLinkLogin = isLinkUser(state);

  return isLinkLogin;
};
