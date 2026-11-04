import type { PaymentState } from '@/lib/hakemus-types';

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
