import { Box } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type Ilmoittautuminen } from '@/lib/valinta-tulos-types';
import { styled } from '@/lib/theme';
import { CheckCircle } from '@mui/icons-material';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(0.5),
}));

const StyledCheck = styled(CheckCircle)(() => ({
  color: ophColors.green2,
}));

export function Ilmoittauduttu({
  ilmoittautuminen,
}: {
  ilmoittautuminen: Ilmoittautuminen;
}) {
  const { t, getLanguage } = useTranslations();

  const ilmoittautumisAika = toFormattedDateTimeStringWithLocale(
    ilmoittautuminen.ilmoittautumisenAikaleima,
    getLanguage(),
  );

  return (
    <StyledBox>
      <StyledCheck />
      <OphTypography variant="body1">
        {t('ilmoittautuminen.ilmoittauduttu', { ilmoittautumisAika })}
        {t(`ilmoittautuminen.tila.${ilmoittautuminen.ilmoittautumistila}`)}
      </OphTypography>
    </StyledBox>
  );
}
