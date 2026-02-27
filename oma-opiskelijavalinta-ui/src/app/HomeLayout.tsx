import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import { Outlet } from 'react-router';
import { PageLayout } from '@/components/PageLayout';
import { Providers } from '@/components/Providers';
import { loadRaamit } from '@/lib/load-raamit';
import { NavigationSpinner } from './NavigationSpinner';
import {
  AuthProvider,
  useAuth,
} from '@/components/authentication/AuthProvider';
import { FullSpinner } from '@/components/FullSpinner';

function InnerHomeLayout() {
  console.log('InnerHomeLayout rendered');
  const { state } = useAuth();
  console.log('state status:', state.status);

  if (state.status !== 'authenticated') {
    return <FullSpinner />;
  }

  // Load raamit for everyone except link login
  useEffect(() => {
    if (state.status === 'authenticated' && state.method === 'cas') {
      loadRaamit();
    }
  }, [state]);

  return (
    <PageLayout>
      <title>Oma Opiskelijavalinta</title>
      <Stack direction="row">
        <main style={{ flexGrow: 1 }}>
          <NavigationSpinner>
            <Outlet />
          </NavigationSpinner>
        </main>
      </Stack>
    </PageLayout>
  );
}

export default function HomeLayout() {
  return (
    <Providers>
      <AuthProvider>
        <InnerHomeLayout />
      </AuthProvider>
    </Providers>
  );
}
