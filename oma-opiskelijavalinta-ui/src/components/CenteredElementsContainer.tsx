import { styled } from '@/lib/theme';
import { Box } from '@mui/material';

export const CenteredElementsContainer = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(3),
  width: 'fit-content',
  alignItems: 'center',
  marginTop: theme.spacing(8),
}));
