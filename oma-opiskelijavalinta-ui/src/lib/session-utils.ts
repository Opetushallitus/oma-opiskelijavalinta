import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';

async function fetchUser() {
  const config = await getConfiguration();
  return await client.get(config.routes.yleiset.userUrl);
}

export async function getUser() {
  const response = await fetchUser();
  return response.data;
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
  console.log(oppijaUrl);
  const logoutUrl = `${oppijaUrl}/cas-oppija/logout?service=${encodeURIComponent(oppijaUrl + '/oma-opintopolku')}`;
  console.log(logoutUrl);
  return logoutUrl;
}
