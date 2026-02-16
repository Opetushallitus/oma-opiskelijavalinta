import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { useTranslations } from '@/hooks/useTranslations';
import type { Hakemus } from '@/lib/hakemus-types';
import { ExpandMore } from '@mui/icons-material';
import { HakukohteetContainer } from '../hakukohde/HakukohteetContainer';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { ophColors } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import type { Haku } from '@/lib/kouta-types';
import { FullSpinner } from '../FullSpinner';
import { useState } from 'react';

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
  },
}));

export function HakukohteetAccordion({
  hakemus,
  tulokset,
}: {
  hakemus: Hakemus;
  tulokset: Array<HakutoiveenTulos>;
}) {
  const { t } = useTranslations();

  return (
    <StyledAccordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        {t('hakutoiveet.haitari')}
      </AccordionSummary>
      <AccordionDetails>
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
  const { t } = useTranslations();

  const {
    hakemuksenTulokset: tulokset,
    isRefetching,
    refetchTulokset,
  } = useHakemuksenTulokset(hakemus, haku);

  const [tuloksetFetched, setTuloksetFetched] = useState(false);

  function fetchTulokset() {
    if (tuloksetFetched) {
      return;
    }
    setTuloksetFetched(true);
    refetchTulokset();
  }

  return (
    <StyledAccordion>
      <AccordionSummary onClick={fetchTulokset} expandIcon={<ExpandMore />}>
        {t('hakutoiveet.haitari')}
      </AccordionSummary>
      {isRefetching && <FullSpinner />}
      {!isRefetching && (
        <AccordionDetails>
          <HakukohteetContainer
            hakemus={hakemus}
            hakemuksenTulokset={tulokset}
            mennytHakemus={true}
          />
        </AccordionDetails>
      )}
    </StyledAccordion>
  );
}
