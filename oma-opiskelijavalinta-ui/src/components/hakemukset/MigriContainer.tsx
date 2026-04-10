import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { type HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { styled } from '@/lib/theme';
import { ExternalLink, ExternalLinkButton } from '../ExternalLink';
import { getMigriUrl } from '@/lib/hakemus-service';
import { BulletedList, BulletItem } from '../BulletedList';
import type { Language } from '@/lib/localization/localization-types';

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

const MIGRI_GUIDE_LINKS: Record<Language, string> = {
  fi: 'https://migri.fi/opiskelijan-opas',
  sv: 'https://migri.fi/sv/guiden-for-studerande',
  en: 'https://migri.fi/en/guide-for-students',
};

export function MigriContainer({
  tulokset,
}: {
  tulokset: Array<HakutoiveenTulos>;
}) {
  const { t, getLanguage } = useTranslations();

  return (
    <StyledBox>
      <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
        {t('migri.otsake')}
      </OphTypography>
      <BulletedList>
        <BulletItem>
          {t('migri.ohjeet')}{' '}
          <ExternalLink
            href={MIGRI_GUIDE_LINKS[getLanguage()]}
            name={t('migri.ohjelinkki')}
          />
        </BulletItem>
        <BulletItem>{t('migri.oppilasnumero')}</BulletItem>
      </BulletedList>
      <ExternalLinkButton
        variant="outlined"
        href={getMigriUrl(tulokset)}
        name={t('migri.hae')}
      />
    </StyledBox>
  );
}
