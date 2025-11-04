import { use } from 'react';

export const isTest = import.meta.env.VITE_TEST === 'true';

export const isDev = import.meta.env.DEV;

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

export const getConfiguration = async () => {
  const backendDomainUrl = import.meta.env.DEV
    ? 'https://localhost:8555'
    : 'https://untuvaopintopolku.fi';

  // TODO muista tuotannossa kielistetyt osoitteet
  const OPPIJA_DOMAIN = 'https://untuvaopintopolku.fi';
  const sessionApiUrl = '/oma-opiskelijavalinta/api/session';
  const VIRKAILIJA_DOMAIN = 'https://virkailija.untuvaopintopolku.fi';

  return {
    routes: {
      yleiset: {
        loginApiUrl: `${backendDomainUrl}/oma-opiskelijavalinta/api/login`,
        oppijaUrl: `${OPPIJA_DOMAIN}`,
        sessionApiUrl: sessionApiUrl,
        lokalisointiUrl: `${VIRKAILIJA_DOMAIN}/lokalisointi/tolgee`,
        backend: backendDomainUrl,
        userUrl: `/oma-opiskelijavalinta/api/user`,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
