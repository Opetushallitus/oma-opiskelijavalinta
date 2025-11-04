import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { User } from '@/lib/types';

async function fetchUser() {
  const config = await getConfiguration();
  return await client.get(config.routes.yleiset.userUrl);
}

export async function getUser() {
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
  const url = await createLogoutUrl();
  window.location.replace(url);
}

async function createLogoutUrl() {
  const conf = await getConfiguration();
  const oppijaUrl = conf.routes.yleiset.oppijaUrl;
  return `${oppijaUrl}/cas-oppija/logout?service=${encodeURIComponent(oppijaUrl + '/oma-opintopolku')}`;
}
