import { createContext, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSession } from '@/lib/session-utils';

export const SessionContext = createContext<
  | {
      isSessionActive: boolean;
      setIsSessionActive: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = useSuspenseQuery({
    queryKey: ['session'],
    queryFn: getSession,
    refetchInterval: 60000, // Pollataan session voimassaoloa 60 sekunnin välein
    staleTime: 0, // Ei cachea
  });

  const [isSessionActive, setIsSessionActive] = useState(
    session.status === 'success',
  );

  const sessionActiveState = useMemo(
    () => ({
      isSessionActive: isSessionActive,
      setIsSessionActive: setIsSessionActive,
    }),
    [isSessionActive, setIsSessionActive],
  );

  return <SessionContext value={sessionActiveState}>{children}</SessionContext>;
};
