import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';

async function fetchUser() {
  const config = await getConfiguration();
  return await client.get(config.routes.yleiset.sessionApiUrl);
}

export async function getUser() {
  const response = await fetchUser();
  return response.data;
}
