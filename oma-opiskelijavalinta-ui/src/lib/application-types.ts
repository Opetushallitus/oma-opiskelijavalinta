import type { Haku, Hakukohde } from './kouta-types';
import type { TranslatedName } from './localization/localization-types';
import type { HakutoiveenTulos } from './valinta-tulos-types';

export type Application = {
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

export type Applications = {
  current: Array<Application>;
  old: Array<Application>;
};
