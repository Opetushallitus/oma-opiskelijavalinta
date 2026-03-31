import Hakemukset, { LinkHakemus } from '@/components/hakemukset/Hakemukset';
import Info from '@/components/Info';
import { useTranslations } from '@/hooks/useTranslations';
import { styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { LinkLogoutButton } from '@/components/LinkLogoutButton';
import { useAuth } from '@/components/authentication/AuthProvider';
import { isLinkUser } from '@/lib/auth/auth-util';

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
      <StyledHeader variant="h1">{t('otsikko')}</StyledHeader>
      <StyledBox>
        {isLinkLogin && <LinkLogoutButton />}
        <Info />
        {isLinkLogin && <LinkHakemus />}
        {!isLinkLogin && <Hakemukset />}
      </StyledBox>
    </Box>
  );
}
