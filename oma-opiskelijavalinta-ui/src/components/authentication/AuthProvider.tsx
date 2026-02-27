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
import {
  notifyUnauthorized,
  setUnauthorizedHandler,
} from '@/components/authentication/auth-events';
import { useConfig } from '@/configuration';
import { FullSpinner } from '@/components/FullSpinner';
import { FetchError } from '@/http-client';

function authReducer(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case 'SESSION_OK':
      return { status: 'authenticated', method: event.method };
    case 'SESSION_401':
      return {
        status: 'unauthenticated',
        hasEverAuthenticated: state.status === 'authenticated',
      };
    case 'LOGOUT':
      return { status: 'unauthenticated', hasEverAuthenticated: true };
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

  // Register global 401 listener
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch({ type: 'SESSION_401' });
    });
  }, []);

  // session polling
  const sessionQuery = useQuery<SessionResponse, unknown>({
    queryKey: ['session'],
    queryFn: getSession,
    refetchInterval: 60000,
    staleTime: 0,
    retry: false,
    throwOnError: (error: unknown) => {
      if (error instanceof FetchError && error.response.status === 401) {
        return false; // handled by auth reducer
      }
      return true; // goes to error boundary
    },
  });

  useEffect(() => {
    if (sessionQuery.data) {
      dispatch({
        type: 'SESSION_OK',
        method: sessionQuery.data.authMethod as AuthMethod,
      });
    } else if (sessionQuery.error) {
      const err = sessionQuery.error;

      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: Response }).response;
        if (response?.status === 401) {
          dispatch({ type: 'SESSION_401' });
          notifyUnauthorized();
        }
      }
    }
  }, [sessionQuery.data, sessionQuery.error]);

  // Redirect logic
  useEffect(() => {
    const isPublicRoute =
      location.pathname.startsWith('/token/') ||
      location.pathname === '/logged-out';

    if (
      state.status === 'unauthenticated' &&
      !state.hasEverAuthenticated &&
      !isPublicRoute
    ) {
      // First-time → redirect to CAS login
      window.location.href = conf.routes.yleiset.loginApiUrl;
      return;
    }

    if (
      state.status === 'unauthenticated' &&
      state.hasEverAuthenticated &&
      !isPublicRoute
    ) {
      // After logout/session expiry → go to logged-out page
      navigate('/logged-out', { replace: true });
    }
  }, [state, location.pathname, navigate, conf.routes.yleiset.loginApiUrl]);

  // Only block rendering if state is unknown (spinner)
  const shouldBlockRender = state.status === 'unknown';

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AuthContext value={value}>
      {shouldBlockRender ? <FullSpinner /> : children}
    </AuthContext>
  );
};
