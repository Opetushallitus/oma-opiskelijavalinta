import { Box } from '@mui/material';
import { notDesktop, styled } from '@/lib/theme';

const WIDTH = '1041px';

export const PageContent = styled(Box)(({ theme }) => ({
  width: WIDTH,
  maxWidth: '100%',
  margin: 'auto',
  [notDesktop(theme)]: {
    maxWidth: '100vw',
    padding: theme.spacing(1, 1),
  },
}));
