import { useTranslations } from '@/hooks/useTranslations';
import { notDesktop, styled } from '@/lib/theme';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { LinkLogoutButton } from '@/components/LinkLogoutButton';
import imgUrl from '@/assets/oma-opintopolku_ikoni.svg';

const WIDTH = '1081px';

const StyledBanner = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '15px 0 15px',
  backgroundColor: ophColors.green2,
  [notDesktop(theme)]: {
    marginBottom: '0.5rem',
  },
}));

const BannerContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  rowGap: theme.spacing(4),
  alignItems: 'center',
  justifyContent: 'space-between',
  width: WIDTH,
  margin: 'auto',
  height: 'inherit',
  maxWidth: '100%',
  [notDesktop(theme)]: {
    maxWidth: '100vw',
    padding: '0 0.5rem 0 0.5rem',
  },
}));

const StyledHeader = styled(OphTypography)(() => ({
  fontSize: '24px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
  color: ophColors.white,
  fontFamily: "'Source Sans Pro', sans-serif",
}));

export default function LinkLoginBanner({
  hideLogoutButton = false,
}: {
  hideLogoutButton: boolean;
}) {
  const { t } = useTranslations();

  const theme = useTheme();

  const isMobile = useMediaQuery(notDesktop(theme));

  return (
    <StyledBanner>
      <BannerContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <Box
              component="img"
              src={imgUrl}
              sx={{ marginRight: '10px', width: '44px', height: '44px' }}
            />
          )}
          <StyledHeader>{t('oma-opintopolku')}</StyledHeader>
        </Box>
        {!hideLogoutButton && <LinkLogoutButton />}
      </BannerContent>
    </StyledBanner>
  );
}
