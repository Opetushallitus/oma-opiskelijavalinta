import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { FullSpinner } from '@/components/FullSpinner';
import { useConfig } from '@/configuration';
import { FetchError } from '@/http-client';
import { ErrorView } from '@/components/ErrorView';

export default function LinkLoginPage() {
  const conf = useConfig();
  const { token } = useParams();
  const navigate = useNavigate();
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

        sessionStorage.setItem('isLinkLogin', 'true');

        navigate('/', { replace: true });
      } catch (e) {
        console.error('Link login failed', e);
        setError(e as Error);
      }
    }

    login();
  }, [token, conf, navigate]);

  if (error) {
    return <ErrorView error={error} reset={() => setError(null)} />;
  }

  return <FullSpinner />;
}
