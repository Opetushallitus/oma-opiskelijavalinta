import Hakemukset from '@/components/hakemukset/Hakemukset';
import Info from '@/components/Info';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useAuth } from '@/components/authentication/AuthProvider';
import { isLinkUser } from '@/lib/auth/auth-util';
import { LinkHakemus } from '@/components/hakemukset/LinkHakemus';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(4),
}));

const StyledHeader = styled(OphTypography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export default function HomePage() {
  const { t } = useTranslations();
  const { state } = useAuth();

  const isLinkLogin = isLinkUser(state);

  return (
    <Box>
      <StyledHeader variant="h1">
        {t(isLinkLogin ? 'otsikko-linkki' : 'otsikko')}
      </StyledHeader>
      <StyledBox>
        <Info />
        {isLinkLogin && <LinkHakemus />}
        {!isLinkLogin && <Hakemukset />}
      </StyledBox>
    </Box>
  );
}
