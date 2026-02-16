import { useTranslations } from '@/hooks/useTranslations';
import { getUser } from '@/lib/session-utils';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BulletedList, BulletItem } from './BulletedList';

export default function Info() {
  const { t } = useTranslations();

  const { data: user } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  return (
    <Box>
      <OphTypography variant="body1">
        {`${user?.kutsumanimi} ${user?.sukunimi}`} oppijanumero:{' '}
        {user?.oppijanumero}
      </OphTypography>
      <OphTypography variant="body1">{t('info.kuvaus')}</OphTypography>
      <BulletedList>
        <BulletItem>{t('info.hakemukset')}</BulletItem>
        <BulletItem>{t('info.liitteet')}</BulletItem>
        <BulletItem>{t('info.tulokset')}</BulletItem>
        <BulletItem>{t('info.vastaanotto')}</BulletItem>
        <BulletItem>{t('info.ilmoittautua')}</BulletItem>
      </BulletedList>
    </Box>
  );
}
