import type {TranslatedName} from "@/lib/localization/localization-types";

export enum Valintatila {
  HYVAKSYTTY = 'HYVAKSYTTY',
  HARKINNANVARAISESTI_HYVAKSYTTY = 'HARKINNANVARAISESTI_HYVAKSYTTY',
  VARASIJALTA_HYVAKSYTTY = 'VARASIJALTA_HYVAKSYTTY',
  VARALLA = 'VARALLA',
  PERUUTETTU = 'PERUUTETTU',
  PERUNUT = 'PERUNUT',
  PERUUNTUNUT = 'PERUUNTUNUT',
  HYLATTY = 'HYLATTY',
  KESKEN = 'KESKEN',
}

export type VastaanotettavuusTila =
  | 'EI_VASTAANOTETTAVISSA'
  | 'VASTAANOTETTAVISSA_SITOVASTI'
  | 'VASTAANOTETTAVISSA_EHDOLLISESTI';

export enum VastaanottoTila {
  KESKEN = 'KESKEN',
  VASTAANOTTANUT_SITOVASTI = 'VASTAANOTTANUT_SITOVASTI',
  EI_VASTAANOTETTU_MAARA_AIKANA = 'EI_VASTAANOTETTU_MAARA_AIKANA',
  PERUNUT = 'PERUNUT',
  PERUUTETTU = 'PERUUTETTU',
  OTTANUT_VASTAAN_TOISEN_PAIKAN = 'OTTANUT_VASTAAN_TOISEN_PAIKAN',
  EHDOLLISESTI_VASTAANOTTANUT = 'EHDOLLISESTI_VASTAANOTTANUT',
}

export type HakutoiveenTulos = {
  hakukohdeOid: string;
  julkaistavissa: boolean;
  valintatila?: string;
  varasijanumero?: number | null;
  vastaanotettavuustila?: VastaanotettavuusTila;
  vastaanottoDeadline: string;
  vastaanottotila?: VastaanottoTila;
  ehdollisestiHyvaksyttavissa?: boolean;
  tilanKuvaukset?: TranslatedName;
};

export enum VastaanottoTilaToiminto {
  PERU = 'Peru',
  VASTAANOTA_SITOVASTI = 'VastaanotaSitovasti',
  VASTAANOTA_SITOVASTI_PERU_ALEMMAT = 'VastaanotaSitovastiPeruAlemmat',
  VASTAANOTA_EHDOLLISESTI = 'VastaanotaEhdollisesti',
}
