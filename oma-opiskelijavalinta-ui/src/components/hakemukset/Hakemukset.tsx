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

function HakemuksetVirhe() {
  const { t } = useTranslations();
  return (
    <ErrorBox sx={{ marginTop: '1.5rem' }}>
      <OphTypography>{t('virhe.palvelin.kuvaus')}</OphTypography>
    </ErrorBox>
  );
}
import {
  toFormattedDateTimeString,
  DEFAULT_DATE_FORMAT,
} from '@/lib/localization/translation-utils';
import type { JSX } from 'react';
import type { Hakemus } from '@/lib/hakemus-types';

export type HakemusTypeParams = {
  hakemus: Hakemus;
  past?: boolean;
  t: (key: string, params?: Record<string, string>) => string;
};

export function determineHakemusType({
  hakemus,
  past = false,
  t,
}: HakemusTypeParams): JSX.Element {
  if (hakemus.enrichmentFailed) {
    const submitted = toFormattedDateTimeString(
      hakemus.submitted,
      DEFAULT_DATE_FORMAT,
    );
    return (
      <Box
        key={`application-${hakemus.oid}`}
        data-test-id={`application-${hakemus.oid}`}
      >
        <ErrorBox sx={{ marginTop: '1.5rem' }}>
          <OphTypography sx={{ fontWeight: 600 }}>
            {t('hakemukset.rikastaminen-epaonnistui.otsikko')}
          </OphTypography>
          <OphTypography>
            {t('hakemukset.rikastaminen-epaonnistui.kuvaus', {
              oid: hakemus.oid,
              submitted,
            })}
          </OphTypography>
        </ErrorBox>
      </Box>
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

function EpaonnistuneetHakemuksetList() {
  const { t } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['hakemukset'],
    queryFn: getHakemukset,
  });

  const epaonnistuneet = [...hakemukset.current, ...hakemukset.old].filter(
    (h) => h.enrichmentFailed,
  );

  if (isEmpty(epaonnistuneet)) return null;

  return (
    <>{epaonnistuneet.map((hakemus) => determineHakemusType({ hakemus, t }))}</>
  );
}

function HakemuksetList() {
  const { t } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['hakemukset'],
    queryFn: getHakemukset,
  });

  const nonFailed = hakemukset.current.filter((h) => !h.enrichmentFailed);

  return isEmpty(hakemukset.current) ? (
    <InfoBox sx={{ marginTop: '1.5rem' }}>
      {t('hakemukset.ei-hakemuksia')}
    </InfoBox>
  ) : (
    <>{nonFailed.map((hakemus) => determineHakemusType({ hakemus, t }))}</>
  );
}

function MenneetHakemuksetList() {
  const { t } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['hakemukset'],
    queryFn: getHakemukset,
  });

  const nonFailed = hakemukset.old.filter((h) => !h.enrichmentFailed);

  return isEmpty(hakemukset.old) ? (
    <InfoBox sx={{ marginTop: '1.5rem' }}>
      {t('hakemukset.ei-menneita-hakemuksia')}
    </InfoBox>
  ) : (
    <>
      {nonFailed.map((hakemus) =>
        determineHakemusType({ hakemus, past: true, t }),
      )}
    </>
  );
}

export default function Hakemukset() {
  const { t } = useTranslations();

  return (
    <>
      <QuerySuspenseBoundary
        suspenseFallback={<></>}
        errorFallback={<HakemuksetVirhe />}
      >
        <EpaonnistuneetHakemuksetList />
      </QuerySuspenseBoundary>
      <Box data-test-id="active-hakemukset">
        <OphTypography variant="h2">
          {t('hakemukset.ajankohtaiset')}
        </OphTypography>
        <QuerySuspenseBoundary errorFallback={<></>}>
          <HakemuksetList />
        </QuerySuspenseBoundary>
      </Box>
      <Box data-test-id="past-hakemukset">
        <OphTypography variant="h2">{t('hakemukset.menneet')}</OphTypography>
        <QuerySuspenseBoundary errorFallback={<></>}>
          <MenneetHakemuksetList />
        </QuerySuspenseBoundary>
      </Box>
    </>
  );
}
