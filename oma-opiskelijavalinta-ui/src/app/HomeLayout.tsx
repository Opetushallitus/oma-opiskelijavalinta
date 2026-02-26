import React from 'react';
import { Stack } from '@mui/material';
import { Outlet } from 'react-router';
import { NavigationSpinner } from './NavigationSpinner';
import { PageLayout } from '@/components/PageLayout';
import { Providers } from '@/components/Providers';
import { loadRaamit } from '@/lib/load-raamit';

export default function HomeLayout() {
  React.useEffect(() => {
    const isLinkLogin =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('isLinkLogin') === 'true';

    if (!isLinkLogin) {
      loadRaamit();
    }
  }, []);

  return (
    <Providers>
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
    </Providers>
  );
}
