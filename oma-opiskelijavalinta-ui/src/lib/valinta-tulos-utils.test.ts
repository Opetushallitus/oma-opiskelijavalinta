import { describe, it, expect } from 'vitest';
import type { Hakukohde } from '@/lib/kouta-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { isHyvaksyttyOdottaaYlempaa } from '@/lib/valinta-tulos-utils';

describe('isHyvaksyttyOdottaaYlempaa', () => {
  const mockHakukohde = (oid: string): Hakukohde =>
    ({
      oid,
      nimi: { fi: '' },
      jarjestyspaikkaHierarkiaNimi: { fi: '' },
    }) as Hakukohde;

  const mockTulos = (
    oid: string,
    valintatila: string,
    vastaanotettavuustila = 'EI_VASTAANOTETTAVISSA',
  ): HakutoiveenTulos =>
    ({
      hakukohdeOid: oid,
      valintatila,
      vastaanotettavuustila,
    }) as HakutoiveenTulos;

  it('returns true when HYVAKSYTTY has higher-priority KESKEN', () => {
    const tulokset = [
      mockTulos('hakukohde-oid-1', 'KESKEN'),
      mockTulos('hakulohde-oid-2', 'HYLATTY'),
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
    ];
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
      mockHakukohde('hakukohde-oid-3'),
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      mockTulos('hakukohde-oid-3,', 'HYVAKSYTTY'),
      2,
    );

    expect(result).toBe(true);
  });

  it('returns true when HYVAKSYTTY has higher-priority VARALLA', () => {
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
    ];
    const tulokset = [
      mockTulos('hakukohde-oid-1', 'VARALLA'),
      mockTulos('hakukohde-oid-2', 'HYVAKSYTTY'),
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      mockTulos('hakukohde-oid-2', 'HYVAKSYTTY'),
      1,
    );

    expect(result).toBe(true);
  });

  it('returns false when HYVAKSYTTY but no higher-priority KESKEN/VARALLA', () => {
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
    ];
    const tulokset = [
      mockTulos('hakukohde-oid-1', 'HYLATTY'),
      mockTulos('hakukohde-oid-2', 'HYVAKSYTTY'),
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      mockTulos('hakukohde-oid-2', 'HYVAKSYTTY'),
      1,
    );

    expect(result).toBe(false);
  });

  it('returns false when not HYVAKSYTTY', () => {
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
    ];
    const tulokset = [
      mockTulos('hakukohde-oid-1', 'KESKEN'),
      mockTulos('hakukohde-oid-2', 'HYLATTY'),
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      mockTulos('hakukohde-oid-2', 'HYLATTY'),
      1,
    );

    expect(result).toBe(false);
  });

  it('returns false when HYVAKSYTTY but vastaanotettavuustila is not EI_VASTAANOTETTAVISSA', () => {
    const hyvaksyttyVastaanotettavissa = mockTulos(
      'hakukohde-oid-2',
      'HYVAKSYTTY',
      'VASTAANOTETTAVISSA_SITOVASTI',
    );

    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
    ];
    const tulokset = [
      mockTulos('hakukohde-oid-1', 'KESKEN'),
      hyvaksyttyVastaanotettavissa,
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      mockTulos(
        'hakukohde-oid-2',
        'HYVAKSYTTY',
        'VASTAANOTETTAVISSA_SITOVASTI',
      ),
      1,
    );

    expect(result).toBe(false);
  });

  it('returns false when HYVAKSYTTY and lower priority KESKEN', () => {
    const hyvaksytty = mockTulos('hakukohde-oid-1', 'HYVAKSYTTY');
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
    ];
    const tulokset = [hyvaksytty, mockTulos('hakukohde-oid-2', 'KESKEN')];

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      hyvaksytty,
      0,
    );

    expect(result).toBe(false);
  });

  it('ignores undefined higher-priority results', () => {
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
      mockHakukohde('hakukohde-oid-3'),
    ];
    const tulokset = [
      undefined,
      mockTulos('hakukohde-oid-2', 'KESKEN'),
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
    ] as Array<HakutoiveenTulos>;

    const result = isHyvaksyttyOdottaaYlempaa(
      hakukohteet,
      tulokset,
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
      2,
    );

    expect(result).toBe(true);
  });
});
