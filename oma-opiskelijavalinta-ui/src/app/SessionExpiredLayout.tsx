import React from 'react';
import { LocalizationProvider } from '@/components/LocalizationProvider';
import { PageLayout } from '@/components/PageLayout';
import { Outlet } from 'react-router';

export default function SessionExpiredLayout() {
  return (
    <LocalizationProvider>
      <PageLayout>
        <main style={{ flexGrow: 1 }}>
          <Outlet />
        </main>
      </PageLayout>
    </LocalizationProvider>
  );
}
