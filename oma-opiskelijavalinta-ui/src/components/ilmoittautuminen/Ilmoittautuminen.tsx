import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Hakemus } from '@/lib/hakemus-types';
import { IlmoittautumisCheckbox } from './IlmoittautumisCheckbox';
import type { Hakukohde } from '@/lib/kouta-types';
import { isTruthy } from 'remeda';
import { Ilmoittauduttu } from './Ilmoittauduttu';
import { isToisenAsteenYhteisHaku } from '@/lib/kouta-utils';
import { styled } from '@/lib/theme';
import { isOili } from './ilmoittautuminen-utils';
import { ExternalLinkButton } from '../ExternalLink';

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

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

  const toisenAsteenYhteisHaku = isToisenAsteenYhteisHaku(hakemus.haku);

  if (
    toisenAsteenYhteisHaku &&
    hakemuksenTulos.ilmoittautuminen?.ilmoittauduttavissa
  ) {
    return (
      <StyledBox
        data-test-id={`ilmoittautuminen-${hakemus.oid}-${hakemuksenTulos.hakukohdeOid}`}
      >
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('ilmoittautuminen.otsikko')}
        </OphTypography>
        <OphTypography variant="body1">
          {t('ilmoittautuminen.info')}
        </OphTypography>
        <IlmoittautumisCheckbox hakutoive={hakukohde} application={hakemus} />
      </StyledBox>
    );
  }

  if (
    !toisenAsteenYhteisHaku &&
    hakemuksenTulos.ilmoittautuminen?.ilmoittauduttavissa &&
    isOili(hakemuksenTulos.ilmoittautuminen)
  ) {
    return (
      <StyledBox
        data-test-id={`ilmoittautuminen-${hakemus.oid}-${hakemuksenTulos.hakukohdeOid}`}
      >
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('ilmoittautuminen.kk-muistathan-otsikko')}
        </OphTypography>
        <OphTypography variant="body1" sx={{ mb: '0.5rem' }}>
          {t('ilmoittautuminen.kk-info')}
        </OphTypography>
        <ExternalLinkButton
          href={hakemuksenTulos.ilmoittautuminen.ilmoittautumistapa?.url ?? ''}
          name={t('ilmoittautuminen.siirry')}
        />
      </StyledBox>
    );
  }

  if (
    isTruthy(hakemuksenTulos.ilmoittautuminen?.ilmoittautumistila) &&
    hakemuksenTulos.ilmoittautuminen?.ilmoittautumistila !== 'EI_TEHTY'
  ) {
    return (
      <StyledBox
        data-test-id={`ilmoittautuminen-${hakemus.oid}-${hakemuksenTulos.hakukohdeOid}`}
      >
        <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
          {t('ilmoittautuminen.otsikko')}
        </OphTypography>
        <Ilmoittauduttu ilmoittautuminen={hakemuksenTulos.ilmoittautuminen} />
      </StyledBox>
    );
  }

  return null;
}
