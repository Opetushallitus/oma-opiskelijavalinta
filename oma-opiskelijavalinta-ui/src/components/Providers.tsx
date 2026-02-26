import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import '@/styles/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/components/Session';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { LocalizationProvider } from './LocalizationProvider';
import { ConfirmationModalProvider } from './ConfirmationModal';
import { NotificationProvider } from './NotificationProvider';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <LocalizationProvider>
            <NotificationProvider>
              <ConfirmationModalProvider>{children}</ConfirmationModalProvider>
            </NotificationProvider>
          </LocalizationProvider>
        </SessionProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
