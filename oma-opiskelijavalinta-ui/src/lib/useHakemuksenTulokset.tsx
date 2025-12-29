import type { Application } from './application-types';
import { useQuery } from '@tanstack/react-query';
import { getValintaTulokset } from './valinta-tulos-service';
import type { Haku } from './kouta-types';

export function useHakemuksenTulokset(hakemus: Application, haku: Haku) {
  const { refetch, data, isPending } = useQuery({
    queryKey: ['hakemuksen-tulokset', hakemus.oid],
    initialData: hakemus.hakemuksenTulokset,
    queryFn: () => getValintaTulokset(hakemus.oid, haku.oid),
  });
  return { refetchTulokset: refetch, hakemuksenTulokset: data, isPending };
}
