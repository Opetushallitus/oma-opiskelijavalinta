import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/hooks/useTranslations';
import { isEmpty, isNullish, isTruthy } from 'remeda';
import { ExternalLinkButton } from '../ExternalLink';
import { HakemusInfo } from './HakemusInfo';
import { HakemusPaper } from './HakemusPaper';
import { VastaanottoContainer } from '../vastaanotto/Vastaanotto';
import type { Hakemus } from '@/lib/hakemus-types';
import { useHakemuksenTulokset } from '@/lib/useHakemuksenTulokset';
import { FullSpinner } from '../FullSpinner';
import { onkoVastaanottoTehty } from '@/lib/vastaanotto.service';
import { HakukohteetContainer } from '../hakukohde/HakukohteetContainer';
import { HakukohteetAccordion } from '../hakukohde/HakukohteetAccordion';
import { onKeskeneraisiaValinnantiloja } from '@/components/valinnantulos/valinnan-tulos-utils';
import { hasKelaUrl } from '@/lib/hakemus-service';
import { KelaContainer } from './KelaContainer';
import { isJatkuvaTaiJoustavaHaku, isKorkeakouluHaku } from '@/lib/kouta-utils';
import { TutustuContainer } from './TutustuContainer';
import { HakemusStatus } from './HakemusStatus';

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
    (!hakemus.processing || !isJatkuvaTaiJoustavaHaku(hakemus.haku)) &&
    (isNullish(hakemus.haku) ||
      (hakemus.haku.hakuaikaKaynnissa &&
        (isEmpty(tulokset) ||
          onKeskeneraisiaValinnantiloja(tulokset, hakemus.hakukohteet ?? []))));

  return (
    <HakemusPaper tabIndex={0} data-test-id={`application-${hakemus.oid}`}>
      <OphTypography variant="h3">
        {translateEntity(hakemus?.haku?.nimi)}
      </OphTypography>
      <HakemusStatus hakemus={hakemus} tulokset={tulokset} />
      <HakemusInfo hakemus={hakemus} tulokset={tulokset} />
      {isTruthy(hakemus.modifyLink) && hakemustaVoiMuokata ? (
        <ExternalLinkButton
          href={hakemus.modifyLink ?? ''}
          name={t('hakemukset.muokkaa')}
        />
      ) : (
        (isEmpty(tulokset) ||
          onKeskeneraisiaValinnantiloja(
            tulokset,
            hakemus.hakukohteet ?? [],
          )) && (
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
          {hasKelaUrl(tulokset) && <KelaContainer tulokset={tulokset} />}
          {onkoVastaanottoTehty(tulokset) &&
            isKorkeakouluHaku(hakemus.haku) && (
              <TutustuContainer hakemus={hakemus} />
            )}
          {onkoVastaanottoTehty(tulokset) && (
            <HakukohteetAccordion hakemus={hakemus} tulokset={tulokset} />
          )}
          {!onkoVastaanottoTehty(tulokset) && (
            <HakukohteetContainer
              hakemus={hakemus}
              hakemuksenTulokset={tulokset}
            />
          )}
        </>
      )}
    </HakemusPaper>
  );
}
