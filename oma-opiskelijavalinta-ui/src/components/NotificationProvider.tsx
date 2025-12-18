import { notDesktop, styled } from '@/lib/theme';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';
import {
  createContext,
  use,
  useCallback,
  useState,
  type ReactNode,
} from 'react';

export type NotificationType = AlertColor;

export type NotificationOptions = {
  message: string;
  type?: NotificationType;
  duration?: number | null;
};

type NotificationContextType = {
  showNotification: (options: NotificationOptions) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

type NotificationState = {
  open: boolean;
  message: string;
  type: NotificationType;
  duration: number | null;
};

const DEFAULT_DURATION = 5000;

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  width: 'min(100% - 20px, 633px)',
  //padding: theme.spacing(4),
  '@media (min-width: 600px)': {
    top: theme.spacing(15),
  },
  [notDesktop(theme)]: {
    top: theme.spacing(10),
  },
  '.MuiAlert-icon': {
    paddingTop: '5px',
    fontSize: '23px',
  },
  '.MuiAlert-action': {
    paddingTop: 0,
    marginTop: '-12px',
  },
  '.MuiPaper-root': {
    padding: theme.spacing(2, 1.5),
  },
}));

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
    duration: DEFAULT_DURATION,
  });

  const showNotification = useCallback(
    ({
      message,
      type = 'info',
      duration = DEFAULT_DURATION,
    }: NotificationOptions) => {
      setNotification({
        open: true,
        message,
        type,
        duration,
      });
    },
    [],
  );

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setNotification((prev) => ({ ...prev, open: false }));
    },
    [],
  );

  return (
    <NotificationContext value={{ showNotification }}>
      {children}
      <StyledSnackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%', fontSize: 'inherit' }}
        >
          {notification.message}
        </Alert>
      </StyledSnackbar>
    </NotificationContext>
  );
}

export function useNotifications() {
  const context = use(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}
