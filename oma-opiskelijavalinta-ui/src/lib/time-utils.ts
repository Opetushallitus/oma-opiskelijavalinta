import { isBefore, format } from 'date-fns';
import { TZDateMini } from '@date-fns/tz';

export const KOUTA_DATE_FORMAT = 'yyyy-MM-dd';

export const toFinnishDate = (date: Date) =>
  new TZDateMini(date, 'Europe/Helsinki');

export function isDateInPast(
  dateString: string,
  formatStr: string = KOUTA_DATE_FORMAT,
) {
  const now = toFinnishDate(new Date());
  return isBefore(dateString, format(now, formatStr));
}
