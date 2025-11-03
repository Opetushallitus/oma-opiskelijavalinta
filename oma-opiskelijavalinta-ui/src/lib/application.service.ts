import { client } from '@/http-client';
import { getConfiguration } from '@/configuration';

export type Application = {
  hakuOid: string;
  hakukohteet: Array<string>;
};

async function fetchApplications() {
  const config = await getConfiguration();
  return await client.get<Array<Application>>(
    config.routes.hakemukset.hakemuksetUrl,
  );
}

export async function getApplications(): Promise<Array<Application>> {
  const response = await fetchApplications();
  return response.data;
}
