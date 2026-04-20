import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import '@/styles/global.css';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { LocalizationProvider } from './LocalizationProvider';
import { ConfirmationModalProvider } from './ConfirmationModal';
import { NotificationProvider } from './NotificationProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <LocalizationProvider>
        <NotificationProvider>
          <ConfirmationModalProvider>{children}</ConfirmationModalProvider>
        </NotificationProvider>
      </LocalizationProvider>
    </NuqsAdapter>
  );
}
