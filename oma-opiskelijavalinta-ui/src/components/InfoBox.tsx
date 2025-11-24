import { Box, type SxProps, type Theme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@/lib/theme';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: ophColors.green6,
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  borderRadius: '4px',
  padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
}));

const StyledInfo = styled(InfoIcon)(() => ({
  color: ophColors.green2,
}));

export const InfoBox = ({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) => {
  return (
    <StyledBox sx={sx}>
      <StyledInfo />
      <Box>{children}</Box>
    </StyledBox>
  );
};
