import { styled } from '@/lib/theme';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  maxWidth: `calc(100% - ${theme.spacing(2.5)})`,
}));

export function BulletItem({ children }: { children: React.ReactNode }) {
  return <StyledListItem disablePadding>{children}</StyledListItem>;
}

export function BulletedList({ children }: { children: React.ReactNode }) {
  return <List sx={{ listStyleType: 'disc' }}>{children}</List>;
}
