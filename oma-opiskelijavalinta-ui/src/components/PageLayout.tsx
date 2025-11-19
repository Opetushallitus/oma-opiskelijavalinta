import { Box, Stack } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { notLarge, styled } from '@/lib/theme';
import { PageContent } from './PageContent';

const ContentWrapper = styled(PageContent)(({ theme }) => ({
  padding: theme.spacing(4),
  [notLarge(theme)]: {
    maxWidth: '100vw',
    padding: theme.spacing(1, 1),
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
