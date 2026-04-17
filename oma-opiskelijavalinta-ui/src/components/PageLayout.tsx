import { Box, Stack } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { notDesktop, styled } from '@/lib/theme';
import { PageContent } from './PageContent';

const ContentWrapper = styled(PageContent)(({ theme }) => ({
  padding: theme.spacing(4),
  [notDesktop(theme)]: {
    maxWidth: '100%',
    padding: theme.spacing(1, 1.875),
  },
}));

const BoxWrapper = styled(Box)(() => ({
  backgroundColor: ophColors.white,
}));

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        alignItems: 'stretch',
      }}
    >
      <ContentWrapper>
        <BoxWrapper>{children}</BoxWrapper>
      </ContentWrapper>
    </Stack>
  );
};
