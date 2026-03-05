import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { ErrorOutline } from '@mui/icons-material';

const StyledError = styled(Box)(({ theme }) => ({
  color: ophColors.white,
  fontSize: '2rem',
  backgroundColor: ophColors.orange3,
  padding: theme.spacing(1.5),
  borderRadius: '45px',
  width: 'fit-content',
}));

export const ErrorPageIcon = () => {
  return (
    <StyledError>
      <ErrorOutline sx={{ fontSize: '2rem' }} />
    </StyledError>
  );
};
