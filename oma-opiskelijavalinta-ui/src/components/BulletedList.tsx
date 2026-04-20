import { styled } from '@/lib/theme';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import type { SxProps, Theme } from '@mui/material';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  maxWidth: `calc(100% - ${theme.spacing(2.5)})`,
}));

type BulletItemProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function BulletItem({ children, sx }: BulletItemProps) {
  return (
    <StyledListItem disablePadding sx={sx}>
      {children}
    </StyledListItem>
  );
}

export function BulletedList({ children }: { children: React.ReactNode }) {
  return (
    <List sx={{ listStyleType: 'disc', marginLeft: '6px' }}>{children}</List>
  );
}
