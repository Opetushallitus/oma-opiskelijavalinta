import type { PaymentState } from '@/lib/hakemus-types';
import { getLanguage } from '@/lib/getLanguage';
import {
  DEFAULT_DATE_FORMAT,
  ENGLISH_DATE_FORMAT,
  toFormattedDateTimeString,
} from '@/lib/localization/translation-utils';

export function isHakemusmaksuMaksettu(
  paymentState?: PaymentState,
): paymentState is 'paid' | 'okByProxy' {
  return paymentState === 'paid' || paymentState === 'okByProxy';
}

export function isHakemusmaksuEraantynyt(
  paymentState?: PaymentState,
): paymentState is 'overdue' {
  return paymentState === 'overdue';
}
export function isHakemusmaksuMaksamatta(
  paymentState?: PaymentState,
): paymentState is 'awaiting' {
  return paymentState === 'awaiting';
}

export function formatHakemusmaksuDate(date: string) {
  const format =
    getLanguage() === 'en' ? ENGLISH_DATE_FORMAT : DEFAULT_DATE_FORMAT;
  return toFormattedDateTimeString(date, format);
}
