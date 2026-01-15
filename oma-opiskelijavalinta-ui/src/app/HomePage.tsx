import Hakemukset from '@/components/hakemukset/Hakemukset';
import Info from '@/components/Info';
import { getUser } from '@/lib/session-utils';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/lib/types';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(4),
}));

const StyledHeader = styled(OphTypography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export default function HomePage() {
  const userData = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
  const user: User = userData.data || {};
  const { t } = useTranslations();

  return (
    <Box>
      <StyledHeader variant="h1">{t('otsikko')}</StyledHeader>
      <StyledBox>
        <Info user={user} />
        <Hakemukset />
      </StyledBox>
    </Box>
  );
}
