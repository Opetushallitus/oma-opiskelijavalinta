import { styled } from '@/lib/theme';
import { Paper } from '@mui/material';

export const PaperWithTopColor = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'topColor',
})<{ topColor?: string }>(({ theme, topColor }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderTop: `4px solid ${topColor ?? theme.palette.primary.main}`,
  boxShadow: `2px 2px 1px 0px rgba(0,0,0, 0.05)`,
  width: '100%',
  maxWidth: '95vw',
  position: 'relative',
  borderRadius: '4px',
  padding: theme.spacing(2.5),
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(1),
  },
}));
