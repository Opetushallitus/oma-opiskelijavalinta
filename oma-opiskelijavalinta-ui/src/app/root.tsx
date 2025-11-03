import '@/lib/service-global';
import { Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Providers } from '@/components/Providers';
import { UntranslatedFullSpinner } from '@/components/FullSpinner';
import { ErrorView } from '@/components/ErrorView';
import { loadRaamit } from '@/lib/load-raamit';
import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    loadRaamit(); // load raamit scripts after Service is defined
  }, []);

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
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorView error={error} />;
}
