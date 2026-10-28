import type { Haku, Hakukohde } from './kouta-types';
import type { TranslatedName } from './localization/localization-types';
import type { HakutoiveenTulos } from './valinta-tulos-types';

export type PaymentState =
  | 'awaiting'
  | 'notRequired'
  | 'okByProxy'
  | 'overdue'
  | 'paid'
  | null;

export type Hakemus = {
  oid: string;
  haku?: Haku | null;
  hakukohteet?: Array<Hakukohde>;
  modifyLink?: string | null;
  hakukierrosPaattyy?: number | null;
  varasijatayttoPaattyy?: number | null;
  valintaTuloksetJulkaistaanHakijoilleAlkaa?: number | null;
  valintaTuloksetJulkaistaanHakijoillePaattyy?: number | null;
  submitted: number;
  formName: TranslatedName;
  priorisoidutHakutoiveet: boolean;
  sijoitteluKaytossa: boolean;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
  processing: boolean;
  paymentState?: PaymentState;
  paymentDueDate?: string;
  paymentSum?: string;
  paymentLink?: string;
  tuloskirjeModified?: number | null;
  enrichmentFailed?: boolean;
  tuloksetFailed?: boolean;
};

export type Hakemukset = {
  current: Array<Hakemus>;
  old: Array<Hakemus>;
};
