import { PaperWithTopColor } from '../PaperWithTopColor';
import { styled } from '@/lib/theme';

export const HakemusPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));
