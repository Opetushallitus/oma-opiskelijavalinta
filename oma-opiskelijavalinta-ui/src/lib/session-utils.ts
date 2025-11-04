import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';
import type { User } from '@/lib/types';

export async function getSession() {
  console.log('Checking session');
  const config = await getConfiguration();
  // http-client will redirect to login on 401
  const response = await client.get(config.routes.yleiset.sessionApiUrl);
  return response.data;
}

async function fetchUser() {
  const config = await getConfiguration();
  return await client.get(config.routes.yleiset.userUrl);
}

// oppija-raamit calls this to get user info
export async function getUser() {
  console.log('Fetching user info');
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
