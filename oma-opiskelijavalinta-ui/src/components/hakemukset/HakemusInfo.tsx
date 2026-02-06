import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { InfoBox } from '../InfoBox';
import {
  DEFAULT_DATE_FORMAT,
  toFormattedDateTimeString,
  toFormattedDateTimeStringWithLocale,
} from '@/lib/localization/translation-utils';
import { isEmpty, isTruthy } from 'remeda';
import type { Haku } from '@/lib/kouta-types';
import type { Hakemus } from '@/lib/hakemus-types';
import {
  isJatkuvaTaiJoustavaHaku,
  isKorkeakouluHaku,
  isToisenAsteenYhteisHaku,
} from '@/lib/kouta-utils';
import { styled } from '@/lib/theme';
import { List, ListItem } from '@mui/material';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { onkoVastaanottoTehty } from '@/lib/vastaanotto.service';
import { onkoJulkaisemattomiaValinnantiloja } from '@/components/valinnantulos/valinnan-tulos-utils';

const BulletItem = styled(ListItem)(({ theme }) => ({
  display: 'list-item',
  marginLeft: theme.spacing(2.5),
  maxWidth: `calc(100% - ${theme.spacing(2.5)})`,
}));

function JulkaistaanJaVarasijatList({
  tuloksetJulkaistaan,
  varasijatPaattyy,
}: {
  tuloksetJulkaistaan: string;
  varasijatPaattyy: string;
}) {
  const { t } = useTranslations();

  return isEmpty(tuloksetJulkaistaan) && isEmpty(varasijatPaattyy) ? null : (
    <List sx={{ listStyleType: 'disc' }}>
      {!isEmpty(tuloksetJulkaistaan) && (
        <BulletItem disablePadding>
          {t('hakemukset.info.julkaistaan', { tuloksetJulkaistaan })}
        </BulletItem>
      )}
      {!isEmpty(varasijatPaattyy) && (
        <BulletItem disablePadding>
          {t('hakemukset.info.varasijat', { varasijatPaattyy })}
        </BulletItem>
      )}
    </List>
  );
}

function HakuMuokkausInfo({ hakemus, haku }: { hakemus: Hakemus; haku: Haku }) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();
  const hakuaikaPaattyy = toFormattedDateTimeStringWithLocale(
    haku.viimeisinPaattynytHakuAika,
    lang,
  );

  const varasijatPaattyy = toFormattedDateTimeString(
    hakemus.varasijatayttoPaattyy,
    DEFAULT_DATE_FORMAT,
  );
  const tuloksetJulkaistaan = isTruthy(
    hakemus.valintaTuloksetJulkaistaanHakijoillePaattyy,
  )
    ? `${toFormattedDateTimeString(hakemus.valintaTuloksetJulkaistaanHakijoilleAlkaa, 'd.M')}-${toFormattedDateTimeString(hakemus.valintaTuloksetJulkaistaanHakijoillePaattyy, DEFAULT_DATE_FORMAT)}`
    : toFormattedDateTimeString(
        hakemus.valintaTuloksetJulkaistaanHakijoilleAlkaa,
        DEFAULT_DATE_FORMAT,
      );

  const isJoustavaOrJatkuva = isJatkuvaTaiJoustavaHaku(haku);
  const isKKHaku = isKorkeakouluHaku(haku);

  if (isJoustavaOrJatkuva && !hakemus.processing) {
    return (
      <InfoBox>
        <OphTypography>
          {t('hakemukset.info.jatkuva.voit-muokata')}
        </OphTypography>
        <br />
        <OphTypography>{t('hakemukset.info.liitepyynnot')}</OphTypography>
      </InfoBox>
    );
  }

  if (isJoustavaOrJatkuva && hakemus.processing) {
    return (
      <InfoBox>
        <OphTypography>
          {t('hakemukset.info.jatkuva.kasittelyssa')}
        </OphTypography>
        <OphTypography>{t('hakemukset.info.yhteystiedot')}</OphTypography>
        <OphTypography>{t('hakemukset.info.liitepyynnot')}</OphTypography>
        <JulkaistaanJaVarasijatList
          varasijatPaattyy={varasijatPaattyy}
          tuloksetJulkaistaan={tuloksetJulkaistaan}
        />
      </InfoBox>
    );
  }

  if (isToisenAsteenYhteisHaku(haku) && haku.hakuaikaKaynnissa) {
    return (
      <InfoBox>
        <OphTypography>{t('hakemukset.info.lahettanyt')}</OphTypography>
        <OphTypography>
          {t('hakemukset.info.voit-muokata', { hakuaikaPaattyy })}
        </OphTypography>
      </InfoBox>
    );
  }

  if (isToisenAsteenYhteisHaku(haku) && !haku.hakuaikaKaynnissa) {
    return (
      <InfoBox>
        <OphTypography>{t('hakemukset.info.hakuaika-paattynyt')}</OphTypography>
        <br />
        <OphTypography>{t('hakemukset.info.yhteystiedot')}</OphTypography>
        <JulkaistaanJaVarasijatList
          varasijatPaattyy={varasijatPaattyy}
          tuloksetJulkaistaan={tuloksetJulkaistaan}
        />
      </InfoBox>
    );
  }

  if (isKKHaku && haku.hakuaikaKaynnissa) {
    return (
      <InfoBox>
        <OphTypography>{t('hakemukset.info.lahettanyt')}</OphTypography>
        <OphTypography>
          {t('hakemukset.info.voit-muokata', { hakuaikaPaattyy })}
        </OphTypography>
        <br />
        <OphTypography>{t('hakemukset.info.liitepyynnot')}</OphTypography>
      </InfoBox>
    );
  }

  if (isKKHaku && !haku.hakuaikaKaynnissa) {
    return (
      <InfoBox>
        <OphTypography>{t('hakemukset.info.hakuaika-paattynyt')}</OphTypography>
        <OphTypography>{t('hakemukset.info.yhteystiedot')}</OphTypography>
        <br />
        <OphTypography>{t('hakemukset.info.liitepyynnot')}</OphTypography>
        <JulkaistaanJaVarasijatList
          varasijatPaattyy={varasijatPaattyy}
          tuloksetJulkaistaan={tuloksetJulkaistaan}
        />
      </InfoBox>
    );
  }

  console.error('Unsupported haku');

  return null;
}

export function HakemusInfo({
  hakemus,
  tulokset,
}: {
  hakemus: Hakemus;
  tulokset: Array<HakutoiveenTulos>;
}) {
  return isTruthy(hakemus.haku) &&
    (isEmpty(tulokset) ||
      onkoJulkaisemattomiaValinnantiloja(
        tulokset,
        hakemus.hakukohteet ?? [],
      )) &&
    !onkoVastaanottoTehty(tulokset) ? (
    <HakuMuokkausInfo haku={hakemus.haku} hakemus={hakemus} />
  ) : null;
}
