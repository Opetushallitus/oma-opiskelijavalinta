import { client } from '@/http-client';
import { getConfiguration, isDev } from '@/configuration';
import type { User } from '@/lib/types';
import { queryClient } from '@/components/Providers';
import type { SessionResponse } from '@/components/authentication/auth-types';

export async function getSession(): Promise<SessionResponse> {
  console.log('session polling');
  const config = await getConfiguration();

  const response = await client.get<SessionResponse>(
    config.routes.yleiset.sessionApiUrl,
  );

  return response.data;
}

async function fetchUser() {
  const config = await getConfiguration();
  return await client.get(config.routes.yleiset.userUrl);
}

// oppija-raamit calls this to get user info
export async function getUser() {
  console.debug('Fetching user info');
  const response = await fetchUser();
  const user = response.data as User;
  // Return with raamit-compatible name field
  const name = `${user.kutsumanimi} ${user.sukunimi}`;
  return {
    ...user,
    name: name ?? '',
  };
}

export async function login() {
  const conf = await getConfiguration();
  window.location.href = conf.routes.yleiset.loginApiUrl;
}

export async function logout() {
  queryClient.clear();
  const url = await createLogoutUrl();
  window.location.replace(url);
}

async function createLogoutUrl() {
  const oppijaUrl = isDev
    ? (import.meta.env.VITE_HAKIJA_DOMAIN ?? 'https://testiopintopolku.fi')
    : document.location.origin;
  return `${oppijaUrl}/cas-oppija/logout?service=${encodeURIComponent(oppijaUrl + '/oma-opintopolku')}`;
}
