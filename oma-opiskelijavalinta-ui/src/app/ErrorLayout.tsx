import { LocalizationProvider } from '@/components/LocalizationProvider';
import { Outlet } from 'react-router';
import React from 'react';

export default function ErrorLayout() {
  return (
    <LocalizationProvider>
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
    </LocalizationProvider>
  );
}
