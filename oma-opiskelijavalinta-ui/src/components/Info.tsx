import { useTranslations } from '@/hooks/useTranslations';
import { getUser } from '@/lib/session-utils';
import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BulletedList, BulletItem } from './BulletedList';
import { isTruthy } from 'remeda';
import { styled } from '@/lib/theme';
import { useAuth } from './authentication/AuthProvider';
import { isLinkUser } from '@/lib/auth/auth-util';
import {
  DEFAULT_DATE_FORMAT,
  toFormattedDateTimeString,
} from '@/lib/localization/translation-utils';

const PersonInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(2.5),
}));

export default function Info() {
  const { t } = useTranslations();

  const { data: user } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  const { state } = useAuth();

  const isLinkLogin = isLinkUser(state);

  return (
    <Box>
      <PersonInfoContainer>
        <OphTypography variant="body1" sx={{ fontWeight: 700 }}>
          {`${user?.kutsumanimi} ${user?.sukunimi}`}
          {isTruthy(user?.syntymaaika) && (
            <OphTypography component="span" sx={{ fontWeight: 'normal' }}>
              {` ${toFormattedDateTimeString(user.syntymaaika, DEFAULT_DATE_FORMAT)}`}
            </OphTypography>
          )}
        </OphTypography>
        {isTruthy(user?.oppijanumero) && (
          <OphTypography variant="body1">
            {t('info.oppijanumero', { oppijanumero: user?.oppijanumero })}
          </OphTypography>
        )}
      </PersonInfoContainer>
      <OphTypography variant="body1">
        {t(isLinkLogin ? 'info.kuvaus-linkki' : 'info.kuvaus')}
      </OphTypography>
      <BulletedList>
        {isLinkLogin && (
          <>
            <BulletItem>{t('info.tulokset')}</BulletItem>
            <BulletItem>{t('info.vastaanotto')}</BulletItem>
            <BulletItem>{t('info.ilmoittautua')}</BulletItem>
          </>
        )}
        {!isLinkLogin && (
          <>
            <BulletItem>{t('info.hakemukset')}</BulletItem>
            <BulletItem>{t('info.liitteet')}</BulletItem>
            <BulletItem>{t('info.tulokset')}</BulletItem>
            <BulletItem>{t('info.vastaanotto')}</BulletItem>
            <BulletItem>{t('info.ilmoittautua')}</BulletItem>
          </>
        )}
      </BulletedList>
    </Box>
  );
}
