import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isEmpty, isNullish, isTruthy } from 'remeda';
import { ExternalLink, ExternalLinkButton } from '../ExternalLink';
import { HakemusInfo } from './HakemusInfo';
import { toFormattedDateTimeStringWithLocale } from '@/lib/localization/translation-utils';
import { HakemusPaper } from './HakemusPaper';
import { VastaanottoContainer } from '../vastaanotto/Vastaanotto';
import type { Hakemus } from '@/lib/hakemus-types';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import { FullSpinner } from '../FullSpinner';
import { onkoVastaanottoTehty } from '@/lib/vastaanotto.service';
import { HakukohteetContainer } from '../hakukohde/HakukohteetContainer';
import { HakukohteetAccordion } from '../hakukohde/HakukohteetAccordion';
import { isJatkuvaTaiJoustavaHaku } from '@/lib/kouta-utils';
import { onkoKeskenTilaisiaValinnantiloja } from '@/lib/valinta-tulos-utils';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { Box } from '@mui/material';

function TilaInfo({
  hakemus,
  tulokset,
}: {
  hakemus: Hakemus;
  tulokset: Array<HakutoiveenTulos>;
}) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();

  let tila = null;

  if (isTruthy(hakemus.haku) && !isJatkuvaTaiJoustavaHaku(hakemus.haku)) {
    const tuloksetJulkaistu =
      tulokset.length > 0 && !onkoKeskenTilaisiaValinnantiloja(tulokset);

    if (hakemus.haku.hakuaikaKaynnissa && !tuloksetJulkaistu) {
      tila = (
        <OphTypography>
          {t('hakemukset.tilankuvaukset.hakuaika-kesken', {
            hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
              hakemus.haku.viimeisinPaattynytHakuAika,
              lang,
            ),
          })}
        </OphTypography>
      );
    } else if (tuloksetJulkaistu) {
      tila = (
        <Box sx={{ display: 'inline-flex', columnGap: '0.4rem' }}>
          <OphTypography>
            {t('hakemukset.tilankuvaukset.kaikki-julkaistu')}
          </OphTypography>
          {hakemus.modifyLink && (
            <ExternalLink
              href={hakemus.modifyLink ?? ''}
              name={t('hakemukset.nayta')}
            />
          )}
        </Box>
      );
    } else if (!hakemus.haku.hakuaikaKaynnissa) {
      tila = (
        <OphTypography>
          {t('hakemukset.tilankuvaukset.valinnat-kesken', {
            hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
              hakemus.haku.viimeisinPaattynytHakuAika,
              lang,
            ),
          })}
        </OphTypography>
      );
    }
  }

  return tila;
}

export function HakemusContainer({ hakemus }: { hakemus: Hakemus }) {
  const { t, translateEntity } = useTranslations();

  if (!hakemus.haku) {
    console.error('Application must have haku associated with it!');
    throw Error('Application must have haku associated with it!');
  }

  const { hakemuksenTulokset: tulokset, isPending } = useHakemuksenTulokset(
    hakemus,
    hakemus.haku,
  );

  const hakemustaVoiMuokata =
    !hakemus.processing &&
    (isNullish(hakemus.haku) ||
      isJatkuvaTaiJoustavaHaku(hakemus.haku) ||
      (hakemus.haku.hakuaikaKaynnissa &&
        (isEmpty(tulokset) || onkoKeskenTilaisiaValinnantiloja(tulokset))));

  return (
    <HakemusPaper tabIndex={0} data-test-id={`application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.haku?.nimi)}
      </OphTypography>
      <TilaInfo hakemus={hakemus} tulokset={tulokset} />
      <HakemusInfo hakemus={hakemus} tulokset={tulokset} />
      {isTruthy(hakemus.modifyLink) && hakemustaVoiMuokata ? (
        <ExternalLinkButton
          href={hakemus.modifyLink ?? ''}
          name={t('hakemukset.muokkaa')}
        />
      ) : (
        (isEmpty(tulokset) || onkoKeskenTilaisiaValinnantiloja(tulokset)) && (
          <ExternalLinkButton
            href={hakemus.modifyLink ?? ''}
            name={t('hakemukset.nayta')}
            variant="outlined"
          />
        )
      )}
      {isPending && <FullSpinner />}
      {!isPending && (
        <>
          <VastaanottoContainer
            application={hakemus}
            hakemuksenTulokset={tulokset}
          />
          {onkoVastaanottoTehty(tulokset) && (
            <HakukohteetAccordion application={hakemus} tulokset={tulokset} />
          )}
          {!onkoVastaanottoTehty(tulokset) && (
            <HakukohteetContainer
              application={hakemus}
              hakemuksenTulokset={tulokset}
            />
          )}
        </>
      )}
    </HakemusPaper>
  );
}
