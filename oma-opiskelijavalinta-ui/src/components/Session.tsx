import { createContext, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSession } from '@/lib/session-utils';

export type SessionContextType = {
  isSessionActive: boolean;
  setIsSessionActive: React.Dispatch<React.SetStateAction<boolean>>;
  isLinkLogin: boolean;
  setIsLinkLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined,
);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = useSuspenseQuery({
    queryKey: ['session'],
    queryFn: getSession,
    refetchInterval: 60000, // Pollataan session voimassaoloa 60 sekunnin välein
    staleTime: 0,
  });

  const [isSessionActive, setIsSessionActive] = useState(
    session.status === 'success',
  );

  const [isLinkLogin, setIsLinkLogin] = useState(false);

  const authContextValue = useMemo(
    () => ({
      isSessionActive,
      setIsSessionActive,
      isLinkLogin,
      setIsLinkLogin,
    }),
    [isSessionActive, isLinkLogin],
  );

  return <SessionContext value={authContextValue}>{children}</SessionContext>;
};
