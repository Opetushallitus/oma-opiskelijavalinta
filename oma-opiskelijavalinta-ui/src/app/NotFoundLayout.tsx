import { LocalizationProvider } from '@/components/LocalizationProvider';
import { PageLayout } from '@/components/PageLayout';
import { Outlet } from 'react-router';
import React from 'react';

export default function NotFoundLayout() {
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
