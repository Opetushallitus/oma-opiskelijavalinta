import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { IlmoittautumisCheckbox } from './IlmoittautumisCheckbox';
import type { Hakukohde } from '@/lib/kouta-types';

export function IlmoittautuminenContainer({
  hakemus,
  hakemuksenTulos,
  hakukohde,
}: {
  hakemus: Hakemus;
  hakemuksenTulos: HakutoiveenTulos;
  hakukohde: Hakukohde;
}) {
  const { t } = useTranslations();

  return !hakemuksenTulos.ilmoittautuminen.ilmoittauduttavissa ? null : (
    <Box
      sx={{ width: '100%', mt: '1.5rem' }}
      data-test-id={`ilmoittautuminen-${hakemus.oid}-${hakemuksenTulos.hakukohdeOid}`}
    >
      <OphTypography variant="body1">
        {t('ilmoittautuminen.otsikko')}
      </OphTypography>
      <IlmoittautumisCheckbox hakutoive={hakukohde} application={hakemus} />
    </Box>
  );
}
