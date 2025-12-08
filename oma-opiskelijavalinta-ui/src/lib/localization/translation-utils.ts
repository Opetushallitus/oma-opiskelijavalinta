import { isNullish } from 'remeda';
import type {
  Language,
  TranslatedDescription,
  TranslatedName,
} from './localization-types';
import { format } from 'date-fns';
import { TZDateMini } from '@date-fns/tz';

export function translateDescription(
  translated?: TranslatedDescription,
  userLanguage: Language = 'fi',
): string {
  if (!translated) return '';

  const key = userLanguage.toUpperCase() as keyof TranslatedDescription;

  return (
    translated[key]?.trim() ||
    translated.FI?.trim() ||
    translated.EN?.trim() ||
    translated.SV?.trim() ||
    ''
  );
}

export function translateName(
  translated: TranslatedName,
  userLanguage: Language = 'fi',
): string {
  const prop = userLanguage as keyof TranslatedName;
  const translation = translated[prop];
  if (translation && translation?.trim().length > 0) {
    return translated[prop] || '';
  } else if (translated.fi && translated.fi.trim().length > 0) {
    return translated.fi;
  } else if (translated.en && translated.en.trim().length > 0) {
    return translated.en;
  }
  return translated.sv || '';
}

const toFinnishDate = (date: Date) => new TZDateMini(date, 'Europe/Helsinki');

export const DEFAULT_DATE_TIME_FORMAT = `d.M.yyyy 'klo' HH:mm`;
export const SWEDISH_DATE_TIME_FORMAT = `d.M.yyyy 'kl.' HH:mm`;
export const ENGLISH_DATE_TIME_FORMAT = `MMM. d, yyyy 'at' HH:mm a z`;

export function toFormattedDateTimeString(
  value: number | Date | string | null | undefined,
  formatStr: string = DEFAULT_DATE_TIME_FORMAT,
): string {
  if (isNullish(value)) {
    return '';
  }
  try {
    const zonedDate = toFinnishDate(new Date(value));
    return format(zonedDate, formatStr);
  } catch (error) {
    console.warn(error);
    console.warn(
      'Caught error when trying to format date, returning empty string',
    );
    return '';
  }
}

export function toFormattedDateTimeStringWithLocale(
  value: number | Date | string | null | undefined,
  language: Language = 'fi',
): string {
  if (language === 'en') {
    const formatted = toFormattedDateTimeString(
      value,
      ENGLISH_DATE_TIME_FORMAT,
    );
    // apparently you cannot format to UTC +2 with date-fns directly
    return formatted.replace('GMT', 'UTC');
  }
  return toFormattedDateTimeString(
    value,
    language === 'sv' ? SWEDISH_DATE_TIME_FORMAT : DEFAULT_DATE_TIME_FORMAT,
  );
}
