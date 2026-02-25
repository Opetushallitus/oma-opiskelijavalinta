import '@/lib/service-global';
import { Outlet, Scripts, ScrollRestoration } from 'react-router';
import { UntranslatedFullSpinner } from '@/components/FullSpinner';
import { GenericErrorPage } from '@/components/GenericErrorPage';
import React from 'react';
import { LocalizationProvider } from '@/components/LocalizationProvider';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Scripts />
        <ScrollRestoration />
        <div id="oppija-raamit-footer-here" />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return <UntranslatedFullSpinner />;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <LocalizationProvider>
      <GenericErrorPage error={error} />
    </LocalizationProvider>
  );
}
