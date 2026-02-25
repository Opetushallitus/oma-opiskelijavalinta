import React from 'react';
import { LocalizationProvider } from '@/components/LocalizationProvider';
import { PageLayout } from '@/components/PageLayout';
import { Outlet } from 'react-router';

export default function LoggedOutLayout() {
  return (
    <LocalizationProvider>
      <PageLayout>
        <title>Oma Opiskelijavalinta</title>
        <main style={{ flexGrow: 1 }}>
          <Outlet />
        </main>
      </PageLayout>
    </LocalizationProvider>
  );
}
