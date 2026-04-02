import React from 'react';
import { LocalizationProvider } from '@/components/LocalizationProvider';
import { PageLayout } from '@/components/PageLayout';
import { Outlet } from 'react-router';
import LinkLoginBanner from '@/components/LinkLoginBanner';

export default function LoggedOutLayout() {
  return (
    <LocalizationProvider>
      <>
        <LinkLoginBanner hideLogoutButton={true} />
        <PageLayout>
          <main style={{ flexGrow: 1 }}>
            <Outlet />
          </main>
        </PageLayout>
      </>
    </LocalizationProvider>
  );
}
