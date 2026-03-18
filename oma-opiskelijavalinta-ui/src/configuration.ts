import { use } from 'react';

export const isTest = import.meta.env.VITE_TEST === 'true';

export const isDev = import.meta.env.DEV;

export const localTranslations =
  import.meta.env.VITE_LOCAL_TRANSLATIONS === 'true';

const BACKEND_API = '/oma-opiskelijavalinta/api';

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
        loginApiUrl: `${BACKEND_API}/login`,
        linkLoginApiUrl: `${BACKEND_API}/link-login`,
        linkLogoutApiUrl: `${BACKEND_API}/link-logout`,
        sessionApiUrl: `${BACKEND_API}/session`,
        expiredUrl: `${HAKIJA_DOMAIN}/oma-opiskelijavalinta/session-expired`,
        lokalisointiUrl: `${VIRKAILIJA_DOMAIN}/lokalisointi/tolgee`,
        userUrl: `${BACKEND_API}/user`,
        konfo: `${HAKIJA_DOMAIN}/konfo`,
      },
      hakemukset: {
        hakemuksetUrl: `${BACKEND_API}/hakemukset`,
        muokkausUrl: `${HAKIJA_DOMAIN}/hakemus?modify`,
      },
      ilmoittautuminen: `${BACKEND_API}/ilmoittautuminen`,
      vastaanotto: `${BACKEND_API}/vastaanotto`,
      valintatulos: `${BACKEND_API}/valintatulos`,
      tuloskirje: `${BACKEND_API}/tuloskirje/haku`,
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
