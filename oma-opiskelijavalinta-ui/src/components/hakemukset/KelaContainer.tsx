import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import type { Hakemus } from '@/lib/hakemus-types';
import { getKelaUrl } from '@/lib/hakemus.service';
import { Box } from '@mui/material';
import { styled } from '@/lib/theme';

const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1.5),
}));

export function KelaContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t } = useTranslations();

  const kelaUrl = getKelaUrl(hakemus);

  return isTruthy(kelaUrl) ? (
    <StyledBox>
      <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
        {t('kela.otsake')}
      </OphTypography>
      <ExternalLinkButton
        variant="outlined"
        href={getKelaUrl(hakemus) ?? ''}
        name={t('kela.linkki')}
      />
    </StyledBox>
  ) : null;
}
