import { use } from 'react';

export const isTest = import.meta.env.VITE_TEST === 'true';

export const isDev = import.meta.env.DEV;

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

export const getConfiguration = async () => {
  const backendDomainUrl = isDev ? 'https://localhost:8555' : '';

  const sessionApiUrl = '/oma-opiskelijavalinta/api/session';
  const VIRKAILIJA_DOMAIN = isDev
    ? 'https://virkailija.untuvaopintopolku.fi'
    : '';

  return {
    routes: {
      yleiset: {
        loginApiUrl: `${backendDomainUrl}/oma-opiskelijavalinta/api/login`,
        sessionApiUrl: sessionApiUrl,
        lokalisointiUrl: `${VIRKAILIJA_DOMAIN}/lokalisointi/tolgee`,
        userUrl: `/oma-opiskelijavalinta/api/user`,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
