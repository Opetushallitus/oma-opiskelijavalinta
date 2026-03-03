import { styled } from '@/lib/theme';
import { Box } from '@mui/material';

export const RowFlexBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(1),
  flexWrap: 'wrap',
}));
