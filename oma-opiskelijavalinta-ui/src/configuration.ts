import { use } from 'react';

export const isTest = import.meta.env.VITE_TEST === 'true';

export const isDev = import.meta.env.DEV;

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

export const getConfiguration = async () => {
  const backendDomainUrl = isDev ? 'https://localhost:8555' : '';

  const sessionApiUrl = '/oma-opiskelijavalinta/api/session';

  let VIRKAILIJA_DOMAIN = '';
  if (isDev) {
    VIRKAILIJA_DOMAIN = 'https://virkailija.testiopintopolku.fi';
  } else if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    VIRKAILIJA_DOMAIN = `https://virkailija.${host}`;
  }

  return {
    routes: {
      yleiset: {
        loginApiUrl: `${backendDomainUrl}/oma-opiskelijavalinta/api/login`,
        sessionApiUrl: sessionApiUrl,
        lokalisointiUrl: `${VIRKAILIJA_DOMAIN}/lokalisointi/tolgee`,
        userUrl: `/oma-opiskelijavalinta/api/user`,
      },
      hakemukset: {
        hakemuksetUrl: `/oma-opiskelijavalinta/api/application`,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
