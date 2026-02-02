import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { IlmoittautumisCheckbox } from './IlmoittautumisCheckbox';
import type { Hakukohde } from '@/lib/kouta-types';
import { isTruthy } from 'remeda';
import { Ilmoittauduttu } from './Ilmoittauduttu';

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

  if (hakemuksenTulos.ilmoittautuminen?.ilmoittauduttavissa) {
    return (
      <Box
        sx={{ width: '100%', margin: '1.5rem 0' }}
        data-test-id={`ilmoittautuminen-${hakemus.oid}-${hakemuksenTulos.hakukohdeOid}`}
      >
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('ilmoittautuminen.otsikko')}
        </OphTypography>
        <IlmoittautumisCheckbox hakutoive={hakukohde} application={hakemus} />
      </Box>
    );
  }

  if (
    isTruthy(hakemuksenTulos.ilmoittautuminen?.ilmoittautumistila) &&
    hakemuksenTulos.ilmoittautuminen?.ilmoittautumistila !== 'EI_TEHTY'
  ) {
    return (
      <Box
        sx={{ width: '100%', margin: '1.5rem 0' }}
        data-test-id={`ilmoittautuminen-${hakemus.oid}-${hakemuksenTulos.hakukohdeOid}`}
      >
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('ilmoittautuminen.otsikko')}
        </OphTypography>
        <Ilmoittauduttu ilmoittautuminen={hakemuksenTulos.ilmoittautuminen} />
      </Box>
    );
  }

  return null;
}
