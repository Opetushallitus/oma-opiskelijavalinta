import { styled } from '@/lib/theme';
import { Box, type SxProps, type Theme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import WarningIcon from '@mui/icons-material/Warning';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFCC331A',
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  borderRadius: '4px',
  padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
  marginTop: theme.spacing(1),
}));

const StyledWarning = styled(WarningIcon)(() => ({
  color: ophColors.yellow1,
}));

export const AlertBox = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) => {
  return (
    <StyledBox sx={sx} data-test-id="alert-box">
      <StyledWarning />
      <Box>{children}</Box>
    </StyledBox>
  );
};
