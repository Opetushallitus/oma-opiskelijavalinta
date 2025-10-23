import Applications from '@/components/Applications';
import Info from '@/components/Info';
import { getUser } from '@/lib/session-utils';
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

export default function HomePage() {
  type User = {
    displayName?: string;
    personOid?: string;
  };

  const userData = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
  const user: User = userData.data || {};
  return (
    <Box>
      <StyledHeader variant="h1">Oma Opiskelijavalinta</StyledHeader>
      <StyledBox>
        <Info />
        <Applications />
      </StyledBox>
    </Box>
  );
}
