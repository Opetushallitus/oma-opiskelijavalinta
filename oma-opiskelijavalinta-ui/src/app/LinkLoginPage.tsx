import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { FullSpinner } from '@/components/FullSpinner';
import { useConfig } from '@/configuration';
import { FetchError } from '@/http-client';
import { ErrorView } from '@/components/ErrorView';
import { useAuth } from '@/components/authentication/AuthProvider';
import type { AuthMethod } from '@/components/authentication/auth-types';

export default function LinkLoginPage() {
  const conf = useConfig();
  const { token } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    async function login() {
      try {
        if (!token) throw new Error('Token missing');

        const response = await fetch(
          `${conf.routes.yleiset.linkLoginApiUrl}?token=${token}`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new FetchError(response);
        }

        // Update auth state
        dispatch({ type: 'SESSION_OK', method: 'link' as AuthMethod });

        // Navigate to main app
        navigate('/', { replace: true });
      } catch (e) {
        console.error('Link login failed', e);
        setError(e as Error);
      }
    }

    login();
  }, [token, conf, navigate, dispatch]);

  if (error) {
    return <ErrorView error={error} reset={() => setError(null)} />;
  }

  return <FullSpinner />;
}
