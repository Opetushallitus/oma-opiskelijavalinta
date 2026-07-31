import { describe, test, expect } from 'vitest';
import { isDateInPast, KOUTA_DATE_FORMAT, toFinnishDate } from './time-utils';
import { format, addDays } from 'date-fns';

describe('isDateInPast', () => {
  test('returns true if date is in past', () => {
    expect(isDateInPast('2024-01-01')).toEqual(true);
  });

  test('returns false if date is in future', () => {
    const dateInFuture = addDays(toFinnishDate(new Date()), 1);
    expect(isDateInPast(format(dateInFuture, KOUTA_DATE_FORMAT))).toEqual(
      false,
    );
  });
});
