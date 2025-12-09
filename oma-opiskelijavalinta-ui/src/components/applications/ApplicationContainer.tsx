import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import {
  type Application,
  type Hakukohde,
  type HakutoiveenTulos,
} from '@/lib/application.service';
import { isNonNull, isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import { ApplicationInfo } from './ApplicationInfo';
import { Hakutoive } from './Hakutoive';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { ApplicationPaper } from './ApplicationPaper';
import { VastaanottoContainer } from '../vastaanotto/Vastaanotto';

function HakukohteetContainer({
  hakukohteet,
  priorisoidutHakutoiveet,
  hakemuksenTulokset,
}: {
  hakukohteet: Array<Hakukohde>;
  priorisoidutHakutoiveet: boolean;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
}) {
  return (
    <Box sx={{ width: '100%' }}>
      {hakukohteet.map((hk, idx) => {
        const tulos = hakemuksenTulokset.find((t) => t.hakukohdeOid === hk.oid);

        return (
          <Hakutoive
            key={hk.oid}
            hakukohde={hk}
            prioriteetti={idx + 1}
            priorisoidutHakutoiveet={priorisoidutHakutoiveet}
            tulos={tulos}
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
      <VastaanottoContainer application={application} />
      <OphTypography variant="h4" sx={{ fontWeight: 'normal' }}>
        {t('hakemukset.hakutoiveet')}
      </OphTypography>
      <HakukohteetContainer
        hakukohteet={application?.hakukohteet ?? []}
        priorisoidutHakutoiveet={application?.priorisoidutHakutoiveet}
        hakemuksenTulokset={application.hakemuksenTulokset}
      />
    </ApplicationPaper>
  );
}
