import { use } from 'react';

export const getConfiguration = async () => {
  const apiUrl = import.meta.env.DEV
      ? 'https://localhost:8555'
      : 'https://untuvaopintopolku.fi';

  return {
    routes: {
      yleiset: {
        loginApiUrl: `${apiUrl}/oma-opiskelijavalinta/api/login`
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
