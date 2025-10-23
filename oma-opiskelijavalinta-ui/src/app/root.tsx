import { Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Providers } from '@/components/Providers';
import { UntranslatedFullSpinner } from '@/components/FullSpinner';
import { ErrorView } from '@/components/ErrorView';

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
        {/*TODO raamit in OPHYOS-15*/}
        {/*<script defer id="apply-raamit" type="text/javascript" src="/js/apply-raamit.js"></script>*/}
        {/*<script defer id="apply-modal" type="text/javascript" src="/oppija-raamit/js/apply-modal.js"></script>*/}
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
