import { QuerySuspenseBoundary } from '@/components/QuerySuspenseBoundary';
import {
  SessionExpired,
  useIsSessionExpired,
} from '@/components/SessionExpired';
import {Box, Stack} from '@mui/material';
import { Outlet } from 'react-router';
import { NavigationSpinner } from './NavigationSpinner';

export default function HomeLayout() {
  const { isSessionExpired } = useIsSessionExpired();
  console.log('isSessionExpired', isSessionExpired);
  return (
    <QuerySuspenseBoundary>
      {isSessionExpired && <SessionExpired />}
      <Box>
        <title>Oma Opiskelijavalinta</title>
        <Stack direction="row">
          <main style={{ flexGrow: 1 }}>
            <NavigationSpinner>
              <QuerySuspenseBoundary>
                <Outlet />
              </QuerySuspenseBoundary>
            </NavigationSpinner>
          </main>
        </Stack>
      </Box>
    </QuerySuspenseBoundary>
  );
}
