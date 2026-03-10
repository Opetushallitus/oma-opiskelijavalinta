import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import { Outlet } from 'react-router';
import { PageLayout } from '@/components/PageLayout';
import { Providers } from '@/components/Providers';
import { loadRaamit } from '@/lib/load-raamit';
import { NavigationSpinner } from './NavigationSpinner';
import { useAuth } from '@/components/authentication/AuthProvider';
import { FullSpinner } from '@/components/FullSpinner';
import { useTranslations } from '@/hooks/useTranslations';

function InnerHomeLayout() {
  const { state } = useAuth();
  const { t } = useTranslations();

  const method = state.status === 'authenticated' ? state.method : undefined;

  useEffect(() => {
    if (method === 'cas') {
      loadRaamit();
    }
  }, [method]);

  if (state.status !== 'authenticated') {
    return <FullSpinner />;
  }

  return (
    <PageLayout>
      <title>{t('otsikko')}</title>
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
      <InnerHomeLayout />
    </Providers>
  );
}
