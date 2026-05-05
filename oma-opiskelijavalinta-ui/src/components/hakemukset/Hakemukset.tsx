import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from '../QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakemukset } from '@/lib/hakemus-service';
import { isEmpty, isNonNullish } from 'remeda';
import { HakemusContainer } from './HakemusContainer';
import { InfoBox } from '../InfoBox';
import { ErrorBox } from '../ErrorBox';
import { MennytHakemusContainer } from './MennytHakemusContainer';
import { HautonHakemusContainer } from './HautonHakemusContainer';
import type { JSX } from 'react';
import type { Hakemus } from '@/lib/hakemus-types';

export type HakemusTypeParams = {
  hakemus: Hakemus;
  past?: boolean;
  t: (key: string) => string;
};

export function determineHakemusType({
  hakemus,
  past = false,
  t,
}: HakemusTypeParams): JSX.Element {
  if (hakemus.enrichmentFailed) {
    return (
      <ErrorBox key={`application-${hakemus.oid}`} sx={{ marginTop: '1.5rem' }}>
        {t('hakemukset.rikastaminen-epaonnistui')}
      </ErrorBox>
    );
  }
  return isNonNullish(hakemus.haku) && past ? (
    <MennytHakemusContainer
      key={`application-${hakemus.oid}}`}
      hakemus={hakemus}
    />
  ) : isNonNullish(hakemus.haku) ? (
    <HakemusContainer key={`application-${hakemus.oid}}`} hakemus={hakemus} />
  ) : (
    <HautonHakemusContainer
      key={`application-${hakemus.oid}}`}
      hakemus={hakemus}
    />
  );
}

function HakemuksetList() {
  const { t } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['hakemukset'],
    queryFn: getHakemukset,
  });

  return isEmpty(hakemukset.current) ? (
    <InfoBox sx={{ marginTop: '1.5rem' }}>
      {t('hakemukset.ei-hakemuksia')}
    </InfoBox>
  ) : (
    <>
      {hakemukset?.current.map((hakemus) =>
        determineHakemusType({ hakemus, t }),
      )}
    </>
  );
}

function MenneetHakemuksetList() {
  const { t } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['hakemukset'],
    queryFn: getHakemukset,
  });

  return isEmpty(hakemukset.old) ? (
    <InfoBox sx={{ marginTop: '1.5rem' }}>
      {t('hakemukset.ei-menneita-hakemuksia')}
    </InfoBox>
  ) : (
    <>
      {hakemukset?.old.map((hakemus) =>
        determineHakemusType({ hakemus, past: true, t }),
      )}
    </>
  );
}

export default function Hakemukset() {
  const { t } = useTranslations();

  return (
    <>
      <Box data-test-id="active-hakemukset">
        <OphTypography variant="h2">
          {t('hakemukset.ajankohtaiset')}
        </OphTypography>
        <QuerySuspenseBoundary>
          <HakemuksetList />
        </QuerySuspenseBoundary>
      </Box>
      <Box data-test-id="past-hakemukset">
        <OphTypography variant="h2">{t('hakemukset.menneet')}</OphTypography>
        <QuerySuspenseBoundary>
          <MenneetHakemuksetList />
        </QuerySuspenseBoundary>
      </Box>
    </>
  );
}
