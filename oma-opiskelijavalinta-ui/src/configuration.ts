import { use } from 'react';

export const getConfiguration = async () => {
  const DOMAIN = 'https://untuvaopintopolku.fi';

  return {
    routes: {
      yleiset: {
        casLoginUrl: `${DOMAIN}/cas-oppija/login`,
      },
    },
  };
};

export const configPromise = getConfiguration();

export const useConfig = () => use(configPromise);
