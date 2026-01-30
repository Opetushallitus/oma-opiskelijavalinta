import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';

export const MultiInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
  a: {
    color: ophColors.grey900,
  },
}));
