import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { QuerySuspenseBoundary } from '../QuerySuspenseBoundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakemukset } from '@/lib/hakemus.service';
import { isEmpty, isNonNullish } from 'remeda';
import { HakemusContainer } from './HakemusContainer';
import { InfoBox } from '../InfoBox';
import { MennytHakemusContainer } from './MennytHakemusContainer';
import { HautonHakemusContainer } from './HautonHakemusContainer';
import type { JSX } from 'react';
import type { Hakemus } from '@/lib/hakemus-types';

function determineHakemusType(hakemus: Hakemus, past = false): JSX.Element {
  return isNonNullish(hakemus.haku) && past ? (
    <MennytHakemusContainer
      key={`application-${hakemus.oid}}`}
      hakemus={hakemus}
    />
  ) : isNonNullish(hakemus.haku) ? (
    <HakemusContainer key={`application-${hakemus.oid}}`} hakemus={hakemus} />
  ) : (
    <HautonHakemusContainer // OPHYOS-52:ssa tämän paikka saattaa muuttua
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
      {hakemukset?.current.map((application) =>
        determineHakemusType(application),
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
    <>{hakemukset?.old.map((hakemus) => determineHakemusType(hakemus, true))}</>
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
