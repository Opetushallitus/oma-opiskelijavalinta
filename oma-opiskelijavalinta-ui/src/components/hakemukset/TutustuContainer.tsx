import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import type { Hakemus } from '@/lib/hakemus-types';
import { Box } from '@mui/material';
import { styled } from '@/lib/theme';
import type { Language } from '@/types/ui-types';
import { VASTAANOTETTU_TILAT } from '@/lib/valinta-tulos-types';
import { translateName } from '@/lib/localization/translation-utils';

const StyledBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(1.5),
}));

function getTutustuHakutoiveeseenUrl(
  hakemus: Hakemus,
  lang: Language,
): string | null | undefined {
  const vastaanotto = hakemus.hakemuksenTulokset.find(
    (ht) =>
      ht.vastaanottotila && VASTAANOTETTU_TILAT.includes(ht.vastaanottotila),
  );
  const uudenOpiskelijanUrl = hakemus.hakukohteet?.find(
    (hk) => hk.oid === vastaanotto?.hakukohdeOid,
  )?.uudenOpiskelijanUrl;
  return isTruthy(uudenOpiskelijanUrl)
    ? translateName(uudenOpiskelijanUrl, lang)
    : null;
}

export function TutustuContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t, getLanguage } = useTranslations();

  const tutustuUrl = getTutustuHakutoiveeseenUrl(hakemus, getLanguage());

  return isTruthy(tutustuUrl) ? (
    <StyledBox>
      <OphTypography variant="body1" sx={{ fontWeight: 600 }}>
        {t('hakemukset.tutustu')}
      </OphTypography>
      <ExternalLinkButton
        variant="outlined"
        href={tutustuUrl}
        name={t('hakemukset.tutustu-linkki')}
      />
    </StyledBox>
  ) : null;
}
