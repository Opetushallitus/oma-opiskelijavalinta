import type { getUser, login, logout } from '@/lib/session-utils';

declare global {
  interface Window {
    Service: {
      getUser: typeof getUser;
      login: typeof login;
      logout: typeof logout;
    };
  }
}

export {};
