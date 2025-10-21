import { client } from '@/http-client';

async function fetchUser() {
  console.log('Fetching user session');
  const sessionUrl = 'oma-opiskelijavalinta/api/session';
  return await client.get(sessionUrl);
}

export async function getUser() {
  const response = await fetchUser();
  return response.data;
}
