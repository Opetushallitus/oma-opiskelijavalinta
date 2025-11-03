import { getUser, login, logout } from '@/lib/session-utils';

// make sure this runs as soon as the module is imported
if (typeof window !== 'undefined') {
  const w = window as typeof window & {
    Service: {
      getUser: typeof getUser;
      login: typeof login;
      logout: typeof logout;
    };
  };

  w.Service = { getUser, login, logout };
}
