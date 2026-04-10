import { getHakemukset } from '@/lib/hakemus-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import { isEmpty, isNonNullish } from 'remeda';
import { determineHakemusType } from './Hakemukset';
import { QuerySuspenseBoundary } from '../QuerySuspenseBoundary';

function LinkHakemusContent() {
  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['hakemukset'],
    queryFn: getHakemukset,
  });

  if (hakemukset.current.concat(hakemukset.old).length > 1) {
    console.error(
      'Linkillä tunnistautuneella käyttäjällä pitäisi olla vain yksi hakemus',
    );
  }

  if (!isEmpty(hakemukset.current) && isNonNullish(hakemukset.current[0])) {
    return determineHakemusType({ hakemus: hakemukset.current[0] });
  } else if (!isEmpty(hakemukset.old) && isNonNullish(hakemukset.old[0])) {
    return determineHakemusType({ hakemus: hakemukset.old[0], past: true });
  } else {
    console.error('Linkillä tunnistautuneella käyttäjällä ei ollut hakemusta');
    return null;
  }
}

export function LinkHakemus() {
  return (
    <QuerySuspenseBoundary>
      <LinkHakemusContent />
    </QuerySuspenseBoundary>
  );
}
