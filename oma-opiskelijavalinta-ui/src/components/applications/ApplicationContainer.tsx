import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { PaperWithTopColor } from '../PaperWithTopColor';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/hooks/useTranslations';
import { type Application, type Hakukohde } from '@/lib/application.service';
import { isNonNull, isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import { ApplicationInfo } from './ApplicationInfo';
import { Hakutoive } from './Hakutoive';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';

const StyledPaper = styled(PaperWithTopColor)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'start',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

function HakukohteetContainer({
  hakukohteet,
}: {
  hakukohteet: Array<Hakukohde>;
}) {
  return (
    <Box>
      {hakukohteet.map((hk, idx) => (
        <Hakutoive key={hk.oid} hakukohde={hk} prioriteetti={idx + 1} />
      ))}
    </Box>
  );
}

function TilaInfo({ application }: { application: Application }) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();

  let tila = null;

  if (isTruthy(application.haku)) {
    if (application.haku.hakuaikaKaynnissa) {
      tila = t('hakemukset.tilankuvaukset.hakuaika-kesken', {
        hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
          application.haku.viimeisinPaattynytHakuAika,
          lang,
        ),
      });
    } else if (!application.haku.hakuaikaKaynnissa) {
      tila = t('hakemukset.tilankuvaukset.valinnat-kesken', {
        hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
          application.haku.viimeisinPaattynytHakuAika,
          lang,
        ),
      });
    }
  }

  return isNonNull(tila) ? <OphTypography>{tila}</OphTypography> : null;
}

export function ApplicationContainer({
  application,
}: {
  application: Application;
}) {
  const { t, translateEntity } = useTranslations();

  return (
    <StyledPaper tabIndex={0}>
      <OphTypography variant="h3">
        {translateEntity(application?.haku?.nimi)}
      </OphTypography>
      <TilaInfo application={application} />
      <ApplicationInfo application={application} />
      {isTruthy(application.modifyLink) && (
        <ExternalLinkButton
          href={application.modifyLink ?? ''}
          name={t('hakemukset.muokkaa')}
        />
      )}
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <HakukohteetContainer hakukohteet={application?.hakukohteet ?? []} />
    </StyledPaper>
  );
}
