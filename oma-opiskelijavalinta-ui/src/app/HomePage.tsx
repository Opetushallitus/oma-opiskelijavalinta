import Applications from '@/components/Applications';
import Info from '@/components/Info';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(4),
}));

const StyledHeader = styled(OphTypography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export default function HomePage() {
  console.log('HomePage rendered');
  const { data: user } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });
  console.log(user); // temp jotta linter ei herjaa
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
