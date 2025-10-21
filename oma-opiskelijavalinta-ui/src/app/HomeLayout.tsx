import { QuerySuspenseBoundary } from '@/components/QuerySuspenseBoundary';
import {
  SessionExpired,
  useIsSessionExpired,
} from '@/components/SessionExpired';
import { Stack } from '@mui/material';
import { Outlet } from 'react-router';
import { NavigationSpinner } from './NavigationSpinner';
import { PageLayout } from '@/components/PageLayout';

export default function HomeLayout() {
  const { isSessionExpired } = useIsSessionExpired();
  return (
    <QuerySuspenseBoundary>
      {isSessionExpired && <SessionExpired />}
      <PageLayout>
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
      </PageLayout>
    </QuerySuspenseBoundary>
  );
}
