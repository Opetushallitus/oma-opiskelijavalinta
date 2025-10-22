import { Box } from '@mui/material';
import { notLarge, styled } from '@/lib/theme';

const MAX_WIDTH = '1920px';

export const PageContent = styled(Box)(({ theme }) => ({
  maxWidth: MAX_WIDTH,
  margin: 'auto',
  width: 'fit-content',
  [notLarge(theme)]: {
    maxWidth: '100vw',
    padding: theme.spacing(1, 1),
  },
}));
