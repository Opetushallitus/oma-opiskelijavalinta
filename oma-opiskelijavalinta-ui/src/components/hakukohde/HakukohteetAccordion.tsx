import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { styled } from '@/lib/theme';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import type { Hakemus } from '@/lib/hakemus-types';
import type { Haku } from '@/lib/kouta-types';
import { HakukohteetContainer } from '../hakukohde/HakukohteetContainer';
import { FullSpinner } from '../FullSpinner';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { VastaanottoContainer } from '../vastaanotto/Vastaanotto';
import { ErrorBox } from '@/components/ErrorBox';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  '.MuiAccordion-heading': {
    color: ophColors.green2,
    '.MuiAccordionSummary-root': {
      flexDirection: 'row-reverse',
      padding: 0,
      columnGap: theme.spacing(0.5),
      fontSize: '1rem',
    },
  },
  '.MuiAccordionDetails-root': {
    padding: 0,
  },
  h4: {
    margin: 0,
    marginBottom: theme.spacing(2),
  },
}));

export function HakukohteetAccordion({
  hakemus,
  tulokset,
}: {
  hakemus: Hakemus;
  tulokset: Array<HakutoiveenTulos>;
}) {
  const { t, translateEntity } = useTranslations();

  const accordionSummaryId = `hakutoiveet-accordion-${hakemus.oid}`;

  return (
    <StyledAccordion>
      <AccordionSummary
        id={accordionSummaryId}
        expandIcon={<ExpandMore />}
        aria-label={t('hakutoiveet.haitari-nimi', {
          haku: translateEntity(hakemus.haku?.nimi),
        })}
      >
        {t('hakutoiveet.haitari')}
      </AccordionSummary>
      <AccordionDetails aria-labelledby={accordionSummaryId}>
        <HakukohteetContainer hakemus={hakemus} hakemuksenTulokset={tulokset} />
      </AccordionDetails>
    </StyledAccordion>
  );
}

export function MenneetHakukohteetAccordion({
  hakemus,
  haku,
}: {
  hakemus: Hakemus;
  haku: Haku;
}) {
  const { t, translateEntity } = useTranslations();

  const {
    hakemuksenTulokset: tulokset,
    isRefetching,
    refetchTulokset,
    isError,
  } = useHakemuksenTulokset(hakemus, haku);

  const [tuloksetFetched, setTuloksetFetched] = useState(false);

  function fetchTulokset() {
    if (tuloksetFetched) {
      return;
    }
    setTuloksetFetched(true);
    refetchTulokset();
  }

  const accordionSummaryId = `past-hakutoiveet-accordion-${hakemus.oid}`;

  return (
    <StyledAccordion>
      <AccordionSummary
        id={accordionSummaryId}
        onClick={fetchTulokset}
        expandIcon={<ExpandMore />}
        aria-label={t('hakutoiveet.haitari-nimi', {
          haku: translateEntity(haku.nimi),
        })}
      >
        {t('hakutoiveet.haitari')}
      </AccordionSummary>
      {isRefetching && <FullSpinner />}
      {!isRefetching && (
        <AccordionDetails
          sx={{ display: 'flex', flexDirection: 'column', rowGap: '1rem' }}
          aria-labelledBy={accordionSummaryId}
        >
          {isError ? (
            <ErrorBox>
              <OphTypography sx={{ fontWeight: 600 }}>
                {t('tulos.virhe.otsikko')}
              </OphTypography>
              <OphTypography>{t('tulos.virhe.kuvaus')}</OphTypography>
            </ErrorBox>
          ) : (
            <>
              <VastaanottoContainer
                application={hakemus}
                hakemuksenTulokset={tulokset}
                mennytVastaanotto={true}
              />
              <HakukohteetContainer
                hakemus={hakemus}
                hakemuksenTulokset={tulokset}
                mennytHakemus={true}
              />
            </>
          )}
        </AccordionDetails>
      )}
    </StyledAccordion>
  );
}
