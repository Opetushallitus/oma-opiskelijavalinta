import { useTranslations } from '@/hooks/useTranslations';
import type { Hakemus } from '@/lib/hakemus-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { isEmptyish, isTruthy } from 'remeda';
import {
  onKeskeneraisiaTaiJulkaisemattomiaValinnantiloja,
  onKeskeneraisiaValinnantiloja,
} from '../valinnantulos/valinnan-tulos-utils';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { ExternalLink } from '../ExternalLink';
import { KirjeLink } from './KirjeLink';
import { Divider } from '@mui/material';
import { RowFlexBox } from '../FlexBox';

function HakuKaynnissa({ hakemus }: { hakemus: Hakemus }) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();

  return (
    <OphTypography>
      {t('hakemukset.tilankuvaukset.hakuaika-kesken', {
        hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
          hakemus.haku?.viimeisinPaattynytHakuAika,
          lang,
        ),
      })}
    </OphTypography>
  );
}

function TuloksetJulkaistu({ hakemus }: { hakemus: Hakemus }) {
  const { t } = useTranslations();

  return (
    <RowFlexBox>
      <OphTypography>
        {t('hakemukset.tilankuvaukset.kaikki-julkaistu')}
      </OphTypography>
      {hakemus.modifyLink && (
        <ExternalLink
          href={hakemus.modifyLink ?? ''}
          name={` ${t('hakemukset.nayta')}`}
        />
      )}
      {hakemus.modifyLink && hakemus.tuloskirjeModified && (
        <Divider
          sx={{ borderColor: ophColors.black }}
          orientation="vertical"
          flexItem
        />
      )}
      {hakemus.tuloskirjeModified && <KirjeLink hakemus={hakemus} />}
    </RowFlexBox>
  );
}

function ValinnatKesken({
  hakemus,
  naytaLinkkiHakemukseen,
}: {
  hakemus: Hakemus;
  naytaLinkkiHakemukseen: boolean;
}) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();

  return (
    <RowFlexBox>
      <OphTypography>
        {t('hakemukset.tilankuvaukset.valinnat-kesken', {
          hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
            hakemus.haku?.viimeisinPaattynytHakuAika,
            lang,
          ),
        })}
      </OphTypography>
      {naytaLinkkiHakemukseen && hakemus.modifyLink && (
        <ExternalLink
          href={hakemus.modifyLink ?? ''}
          name={` ${t('hakemukset.nayta')}`}
        />
      )}
    </RowFlexBox>
  );
}

export function HakemusStatus({
  hakemus,
  tulokset,
  naytaLinkkiHakemukseen,
}: {
  hakemus: Hakemus;
  tulokset: Array<HakutoiveenTulos>;
  naytaLinkkiHakemukseen: boolean;
}) {
  let tila = null;

  if (isTruthy(hakemus.haku)) {
    const tuloksetValmiit =
      tulokset.length > 0 &&
      !onKeskeneraisiaValinnantiloja(tulokset, hakemus.hakukohteet ?? []);
    const tuloksetValmiitJaJulkaistavissa =
      !onKeskeneraisiaTaiJulkaisemattomiaValinnantiloja(
        tulokset,
        hakemus.hakukohteet ?? [],
      );
    if (
      hakemus.haku.hakuaikaKaynnissa &&
      !tuloksetValmiit &&
      !isEmptyish(hakemus?.haku?.viimeisinPaattynytHakuAika)
    ) {
      tila = <HakuKaynnissa hakemus={hakemus} />;
    } else if (
      hakemus.haku.hakuaikaKaynnissa &&
      tuloksetValmiit &&
      !tuloksetValmiitJaJulkaistavissa
    ) {
      // ei kesken-tilaisia, julkaisematon peruuntunut
      tila = (
        <ValinnatKesken
          naytaLinkkiHakemukseen={naytaLinkkiHakemukseen}
          hakemus={hakemus}
        />
      );
    } else if (tuloksetValmiitJaJulkaistavissa) {
      // ei kesken-tilaisia eikä peruuntuneita
      tila = <TuloksetJulkaistu hakemus={hakemus} />;
    } else if (
      !hakemus.haku.hakuaikaKaynnissa &&
      !isEmptyish(hakemus?.haku?.viimeisinPaattynytHakuAika)
    ) {
      tila = (
        <ValinnatKesken
          naytaLinkkiHakemukseen={naytaLinkkiHakemukseen}
          hakemus={hakemus}
        />
      );
    }
  }

  return tila;
}
