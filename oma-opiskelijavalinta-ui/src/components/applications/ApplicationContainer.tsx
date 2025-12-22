import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isNonNull, isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import { ApplicationInfo } from './ApplicationInfo';
import { Hakutoive } from './Hakutoive';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { ApplicationPaper } from './ApplicationPaper';
import { VastaanottoContainer } from '../vastaanotto/Vastaanotto';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import type { Hakukohde } from '@/lib/kouta-types';
import type { Application } from '@/lib/application-types';
import { isHyvaksyttyOdottaaYlempaa } from '@/lib/valinta-tulos-utils';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import { FullSpinner } from '../FullSpinner';

function HakukohteetContainer({
  applicationOid,
  hakukohteet,
  priorisoidutHakutoiveet,
  hakemuksenTulokset,
}: {
  applicationOid: string;
  hakukohteet: Array<Hakukohde>;
  priorisoidutHakutoiveet: boolean;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
}) {
  return (
    <Box
      sx={{ width: '100%' }}
      data-test-id={`application-hakutoiveet-${applicationOid}`}
    >
      {hakukohteet.map((hk, idx) => {
        const tulos = hakemuksenTulokset.find((t) => t.hakukohdeOid === hk.oid);
        const hyvaksyttyOdottaa =
          tulos &&
          priorisoidutHakutoiveet &&
          isHyvaksyttyOdottaaYlempaa(
            hakukohteet,
            hakemuksenTulokset,
            tulos,
            idx,
          );
        return (
          <Hakutoive
            key={hk.oid}
            hakukohde={hk}
            prioriteetti={idx + 1}
            priorisoidutHakutoiveet={priorisoidutHakutoiveet}
            tulos={tulos}
            odottaaYlempaa={hyvaksyttyOdottaa}
          />
        );
      })}
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

  if (!application.haku) {
    console.error('Application must have haku associated with it!');
    throw Error('Application must have haku associated with it!');
  }

  const { hakemuksenTulokset: tulokset, isPending } = useHakemuksenTulokset(
    application,
    application.haku,
  );

  return (
    <ApplicationPaper
      tabIndex={0}
      data-test-id={`application-${application.oid}`}
    >
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
      {isPending && <FullSpinner />}
      {!isPending && (
        <>
          <VastaanottoContainer
            application={application}
            hakemuksenTulokset={tulokset}
          />
          <OphTypography variant="h4" sx={{ fontWeight: 'normal', mt: 3 }}>
            {tulokset?.length
              ? t('hakemukset.valintatilanne')
              : t('hakemukset.hakutoiveet')}
          </OphTypography>
          <HakukohteetContainer
            applicationOid={application.oid}
            hakukohteet={application?.hakukohteet ?? []}
            priorisoidutHakutoiveet={application?.priorisoidutHakutoiveet}
            hakemuksenTulokset={tulokset}
          />
        </>
      )}
    </ApplicationPaper>
  );
}
