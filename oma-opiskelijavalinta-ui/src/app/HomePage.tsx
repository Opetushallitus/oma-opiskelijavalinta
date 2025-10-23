import Applications from '@/components/Applications';
import Info from '@/components/Info';
import { getUser } from '@/lib/session-utils';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(4),
}));

const StyledHeader = styled(OphTypography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export type User = {
  displayName?: string;
  personOid?: string;
};

export default function HomePage() {
  const userData = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
  const user: User = userData.data || {};
  const { t } = useTranslations();

  return (
    <Box>
      <StyledHeader variant="h1">{t('nimi')}</StyledHeader>
      <StyledBox>
        <Info user={user} />
        <Applications />
      </StyledBox>
    </Box>
  );
}
