import { client } from "@/http-client";

async function fetchUser() {
  //const domain = `https://${window.location.hostname}`;
  const sessionUrl = 'https://localhost:8555/oma-opiskelijavalinta/api/session'
  return await client.get(sessionUrl);
}

export async function getUser() {
  const response = await fetchUser();
  if (response.data) {
    console.log('HERE');
    return {} //await response.json();
  }
  return null;
}
