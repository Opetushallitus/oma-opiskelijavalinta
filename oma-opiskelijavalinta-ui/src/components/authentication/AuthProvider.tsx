import type {
  AuthEvent,
  AuthMethod,
  AuthState,
  SessionResponse,
} from '@/components/authentication/auth-types';
import { createContext, use, useEffect, useMemo, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/lib/session-utils';
import { setUnauthorizedHandler } from '@/components/authentication/auth-events';
import { useConfig } from '@/configuration';
import { FullSpinner } from '@/components/FullSpinner';
import { FetchError } from '@/http-client';

// tilakone
function authReducer(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case 'SESSION_OK':
      return { status: 'authenticated', method: event.method };

    case 'SESSION_401':
      if (state.status === 'authenticated') {
        return { status: 'expired' }; // session expired
      }
      if (state.status === 'unknown') {
        return { status: 'unauthenticated' }; // first entry unauthenticated
      }
      return state; // already loggedOut or unauthenticated

    case 'LOGOUT':
      return { status: 'loggedOut' };

    default:
      return state;
  }
}

export type AuthContextType = {
  state: AuthState;
  dispatch: React.Dispatch<AuthEvent>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const conf = useConfig();

  const [state, dispatch] = useReducer(authReducer, { status: 'unknown' });

  // 401 handler
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch({ type: 'SESSION_401' });
    });
  }, []);

  // sessiopollaus
  const sessionQuery = useQuery<SessionResponse, unknown>({
    queryKey: ['session'],
    queryFn: getSession,
    refetchInterval: state.status === 'authenticated' ? 60000 : false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
    enabled: state.status === 'unknown' || state.status === 'authenticated',
    throwOnError: (error: unknown) => {
      if (error instanceof FetchError && error.response.status === 401) {
        return false; // auth reducer hoitaa 401-tilanteen
      }
      return true; // error boundaryyn muut virhestatukset
    },
  });

  useEffect(() => {
    if (sessionQuery.data) {
      dispatch({
        type: 'SESSION_OK',
        method: sessionQuery.data.authMethod as AuthMethod,
      });
    }
  }, [sessionQuery.data]);

  // Uudelleenohjaukset
  useEffect(() => {
    const isPublicRoute =
      location.pathname.startsWith('/token/') ||
      location.pathname === '/logged-out' ||
      location.pathname === '/session-expired';

    if (state.status === 'unauthenticated' && !isPublicRoute) {
      window.location.href = conf.routes.yleiset.loginApiUrl;
    }
    if (state.status === 'loggedOut' && !isPublicRoute) {
      navigate('/logged-out', { replace: true });
    }
    if (state.status === 'expired' && !isPublicRoute) {
      navigate('/session-expired', { replace: true });
    }
  }, [state, location.pathname, navigate, conf.routes.yleiset.loginApiUrl]);

  // ei rendata sessiotonta tilaa
  const shouldBlockRender = state.status === 'unknown';

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AuthContext value={value}>
      {shouldBlockRender ? <FullSpinner /> : children}
    </AuthContext>
  );
};
