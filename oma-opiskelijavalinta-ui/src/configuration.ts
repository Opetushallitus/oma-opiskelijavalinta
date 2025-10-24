import { use } from 'react';

export const isTest = import.meta.env.VITE_TEST === 'true';

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

export const getConfiguration = async () => {
  const domainUrl = import.meta.env.DEV
    ? 'https://localhost:8555'
    : 'https://untuvaopintopolku.fi';

  const sessionApiUrl = '/oma-opiskelijavalinta/api/session';
  const VIRKAILIJA_DOMAIN = 'https://virkailija.untuvaopintopolku.fi';

  return {
    routes: {
      yleiset: {
        loginApiUrl: `${domainUrl}/oma-opiskelijavalinta/api/login`,
        sessionApiUrl: sessionApiUrl,
        lokalisointiUrl: `${VIRKAILIJA_DOMAIN}/lokalisointi/tolgee`,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
