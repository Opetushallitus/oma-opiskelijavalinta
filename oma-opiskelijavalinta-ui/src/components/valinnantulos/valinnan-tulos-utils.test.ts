import { describe, expect, it } from 'vitest';
import type { Hakukohde } from '@/lib/kouta-types';
import type { HakutoiveenTulos } from '@/lib/valinta-tulos-types';
import { isHyvaksyttyOdottaaYlempaa } from '@/components/valinnantulos/valinnan-tulos-utils';
import type { Hakemus } from '@/lib/hakemus-types';

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
      mockTulos('hakukohde-oid-2', 'HYLATTY'),
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
    ];
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
      mockHakukohde('hakukohde-oid-3'),
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      {
        hakukohteet,
        hakemuksenTulokset: tulokset,
      } as Hakemus,
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
    );

    expect(result).toBe(true);
  });

  it('returns true when HYVAKSYTTY has higher-priority KESKEN (no tulos)', () => {
    const tulokset = [
      mockTulos('hakukohde-oid-2', 'HYLATTY'),
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
    ];
    const hakukohteet = [
      mockHakukohde('hakukohde-oid-1'),
      mockHakukohde('hakukohde-oid-2'),
      mockHakukohde('hakukohde-oid-3'),
    ];

    const result = isHyvaksyttyOdottaaYlempaa(
      {
        hakukohteet,
        hakemuksenTulokset: tulokset,
      } as Hakemus,
      mockTulos('hakukohde-oid-3', 'HYVAKSYTTY'),
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
      { hakukohteet, hakemuksenTulokset: tulokset } as Hakemus,
      mockTulos('hakukohde-oid-2', 'HYVAKSYTTY'),
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
      { hakukohteet, hakemuksenTulokset: tulokset } as Hakemus,
      mockTulos('hakukohde-oid-2', 'HYVAKSYTTY'),
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
      { hakukohteet, hakemuksenTulokset: tulokset } as Hakemus,
      mockTulos('hakukohde-oid-2', 'HYLATTY'),
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
      { hakukohteet, hakemuksenTulokset: tulokset } as Hakemus,
      mockTulos(
        'hakukohde-oid-2',
        'HYVAKSYTTY',
        'VASTAANOTETTAVISSA_SITOVASTI',
      ),
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
      { hakukohteet, hakemuksenTulokset: tulokset } as Hakemus,
      hyvaksytty,
    );

    expect(result).toBe(false);
  });
});
