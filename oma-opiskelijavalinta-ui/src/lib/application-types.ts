import type { Haku, Hakukohde } from './kouta-types';
import type { TranslatedName } from './localization/localization-types';
import type { HakutoiveenTulos } from './valinta-tulos-types';

export type Application = {
  oid: string;
  haku?: Haku | null;
  hakukohteet?: Array<Hakukohde>;
  modifyLink?: string | null;
  hakukierrosPaattyy?: number | null;
  submitted: number;
  formName: TranslatedName;
  priorisoidutHakutoiveet: boolean;
  hakemuksenTulokset: Array<HakutoiveenTulos>;
};

export type Applications = {
  current: Array<Application>;
  old: Array<Application>;
};
