import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isNonNull, isNullish, isTruthy } from 'remeda';
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

function TilaInfo({ hakemus }: { hakemus: Hakemus }) {
  const { t, getLanguage } = useTranslations();

  const lang = getLanguage();

  let tila = null;

  if (isTruthy(hakemus.haku) && !isJatkuvaTaiJoustavaHaku(hakemus.haku)) {
    if (hakemus.haku.hakuaikaKaynnissa) {
      tila = t('hakemukset.tilankuvaukset.hakuaika-kesken', {
        hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
          hakemus.haku.viimeisinPaattynytHakuAika,
          lang,
        ),
      });
    } else if (!hakemus.haku.hakuaikaKaynnissa) {
      tila = t('hakemukset.tilankuvaukset.valinnat-kesken', {
        hakuaikaPaattyy: toFormattedDateTimeStringWithLocale(
          hakemus.haku.viimeisinPaattynytHakuAika,
          lang,
        ),
      });
    }
  }

  return isNonNull(tila) ? <OphTypography>{tila}</OphTypography> : null;
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
      hakemus.haku.hakuaikaKaynnissa);

  return (
    <HakemusPaper tabIndex={0} data-test-id={`application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.haku?.nimi)}
      </OphTypography>
      <TilaInfo hakemus={hakemus} />
      <HakemusInfo hakemus={hakemus} tulokset={tulokset} />
      {isTruthy(hakemus.modifyLink) && hakemustaVoiMuokata ? (
        <ExternalLinkButton
          href={hakemus.modifyLink ?? ''}
          name={t('hakemukset.muokkaa')}
        />
      ) : (
        <ExternalLink
          href={hakemus.modifyLink ?? ''}
          name={t('hakemukset.nayta')}
        />
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
