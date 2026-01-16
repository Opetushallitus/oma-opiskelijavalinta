import type { Haku, Hakukohde } from './kouta-types';
import type { TranslatedName } from './localization/localization-types';
import type { HakutoiveenTulos } from './valinta-tulos-types';

export type Hakemus = {
  oid: string;
  haku?: Haku | null;
  hakukohteet?: Array<Hakukohde>;
  modifyLink?: string | null;
  hakukierrosPaattyy?: number | null;
  varasijatayttoPaattyy?: number | null;
  submitted: number;
  formName: TranslatedName;
  priorisoidutHakutoiveet: boolean;
  sijoitteluKaytossa: boolean;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
};

export type Hakemukset = {
  current: Array<Hakemus>;
  old: Array<Hakemus>;
};
