import { useConfig } from '@/configuration';
import { createContext, use, useMemo, useState } from 'react';
import { OphButton } from '@opetushallitus/oph-design-system';
import {Box} from "@mui/material";

export function SessionExpired() {
  const config = useConfig();

  const loginUrl = new URL(
    config.routes.yleiset.casLoginUrl,
    window.location.origin,
  );
  const serviceUrl = new URL(window.location.href);
  serviceUrl.searchParams.delete('ticket');
  loginUrl.searchParams.set('service', serviceUrl.toString());

  return (
      <Box>
        <OphButton
          variant="contained"
          href={loginUrl.toString()}
          target="_self"
        >
          Kirjaudu
        </OphButton>
    </Box>
  );
}

export const SessionExpiredContext = createContext<
  | {
      isSessionExpired: boolean;
      setIsSessionExpired: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

export const SessionExpiredProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const sessionExpiredState = useMemo(
    () => ({ isSessionExpired, setIsSessionExpired }),
    [isSessionExpired, setIsSessionExpired],
  );

  return (
    <SessionExpiredContext value={sessionExpiredState}>
      {children}
    </SessionExpiredContext>
  );
};

export const useIsSessionExpired = () => {
  const context = use(SessionExpiredContext);
  if (!context) {
    throw new Error(
      'useIsSessionExpired must be used within a SessionExpiredProvider',
    );
  }
  return context;
};
