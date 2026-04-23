import { styled } from '@/lib/theme';
import { Box, type SxProps, type Theme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import ErrorIcon from '@mui/icons-material/Error';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: `rgb(from ${ophColors.orange3} r g b / 0.1)`,
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  borderRadius: '4px',
  padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
  marginTop: 0,
  width: '100%',
}));

const StyledError = styled(ErrorIcon)(() => ({
  color: ophColors.orange3,
}));

export const ErrorBox = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) => {
  return (
    <StyledBox sx={sx} data-test-id="error-box">
      <StyledError />
      <Box>{children}</Box>
    </StyledBox>
  );
};
