import { use } from 'react';

export const getConfiguration = async () => {
  const domainUrl = import.meta.env.DEV
    ? 'https://localhost:8555'
    : 'https://untuvaopintopolku.fi';

  const sessionApiUrl = import.meta.env.DEV
    ? '/oma-opiskelijavalinta/api/session'
    : '/api/session';

  return {
    routes: {
      yleiset: {
        loginApiUrl: `${domainUrl}/oma-opiskelijavalinta/api/login`,
        sessionApiUrl: sessionApiUrl,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
