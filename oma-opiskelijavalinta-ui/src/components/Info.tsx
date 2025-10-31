import { useTranslations } from '@/hooks/useTranslations';
import { notLarge, styled } from '@/lib/theme';
import { Box, List, ListItem } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import type { User } from '@/app/HomePage';

const BulletItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  [notLarge(theme)]: {
    maxWidth: '95vw',
  },
}));

export default function Info({ user }: { user: User }) {
  const { t } = useTranslations();

  return (
    <Box>
      <OphTypography variant="body1">
        {`${user?.kutsumanimi} ${user?.sukunimi}`} oppijanumero:{' '}
        {user?.oppijanumero}
      </OphTypography>
      <OphTypography variant="body1">{t('info.kuvaus')}</OphTypography>
      <List sx={{ listStyleType: 'disc' }}>
        <BulletItem disablePadding>{t('info.hakemukset')}</BulletItem>
        <BulletItem disablePadding>{t('info.liitteet')}</BulletItem>
        <BulletItem disablePadding>{t('info.tulokset')}</BulletItem>
        <BulletItem disablePadding>{t('info.vastaanotto')}</BulletItem>
      </List>
    </Box>
  );
}
