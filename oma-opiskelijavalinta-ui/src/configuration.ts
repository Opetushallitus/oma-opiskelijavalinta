import { use } from 'react';

export const isTest = import.meta.env.VITE_TEST === 'true';

export const isDev = import.meta.env.DEV;

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

export const getConfiguration = async () => {
  let HAKIJA_DOMAIN = '';
  let VIRKAILIJA_DOMAIN = '';
  if (isDev) {
    VIRKAILIJA_DOMAIN =
      import.meta.env.VITE_VIRKAILIJA_DOMAIN ??
      'https://virkailija.testiopintopolku.fi';
    HAKIJA_DOMAIN =
      import.meta.env.VITE_HAKIJA_DOMAIN ?? 'https://testiopintopolku.fi';
  } else if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    VIRKAILIJA_DOMAIN = `https://virkailija.${host}`;
    HAKIJA_DOMAIN = `https://${host}`;
  }

  return {
    routes: {
      yleiset: {
        loginApiUrl: `/oma-opiskelijavalinta/api/login`,
        sessionApiUrl: '/oma-opiskelijavalinta/api/session',
        lokalisointiUrl: `${VIRKAILIJA_DOMAIN}/lokalisointi/tolgee`,
        userUrl: `/oma-opiskelijavalinta/api/user`,
        konfo: `${HAKIJA_DOMAIN}/konfo`,
      },
      hakemukset: {
        hakemuksetUrl: `/oma-opiskelijavalinta/api/applications`,
        muokkausUrl: `${HAKIJA_DOMAIN}/hakemus?modify`,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
