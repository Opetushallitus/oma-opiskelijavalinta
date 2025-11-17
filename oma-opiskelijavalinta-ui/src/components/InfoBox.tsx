import { Box } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@/lib/theme';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#F4FFF4', //use ophColors.green6 when it releases on 1.1.0,
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  borderRadius: '4px',
  padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
}));

const StyledInfo = styled(InfoIcon)(() => ({
  color: ophColors.green2,
}));

export const InfoBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledBox>
      <StyledInfo />
      <Box>{children}</Box>
    </StyledBox>
  );
};
