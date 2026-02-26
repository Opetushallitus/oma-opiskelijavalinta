import { describe, expect, it } from 'vitest';
import type { Hakukohde } from '@/lib/kouta-types';
import { type HakutoiveenTulos, Valintatila } from '@/lib/valinta-tulos-types';
import {
  getAlemmatHyvaksytyt,
  getVarallaOlevatMuutToiveet,
  isEhdollisestiHyvaksyttyVastaanottanutSitovasti,
  isHyvaksyttyOdottaaYlempaa,
} from '@/components/valinnantulos/valinnan-tulos-utils';
import type { Hakemus } from '@/lib/hakemus-types';

describe('isEhdollisestiHyvaksyttySitovastiVastaanottanut', () => {
  const mockTulos = (
    valintatila: string,
    ehdollisestiHyvaksyttavissa: boolean,
    vastaanottotila: string,
  ): HakutoiveenTulos =>
    ({
      valintatila,
      ehdollisestiHyvaksyttavissa,
      vastaanottotila,
    }) as HakutoiveenTulos;
  it('returns true when valintatila is HYVAKSYTTY and vastaanotettavuustila is VASTAANOTTANUT_SITOVASTI', () => {
    const result = isEhdollisestiHyvaksyttyVastaanottanutSitovasti(
      mockTulos('HYVAKSYTTY', true, 'VASTAANOTTANUT_SITOVASTI'),
    );
    expect(result).toBe(true);
  });
  it('returns true when valintatila is HARKINNANVARAISESTI_HYVAKSYTTY and vastaanotettavuustila is VASTAANOTTANUT_SITOVASTI', () => {
    const result = isEhdollisestiHyvaksyttyVastaanottanutSitovasti(
      mockTulos(
        'HARKINNANVARAISESTI_HYVAKSYTTY',
        true,
        'VASTAANOTTANUT_SITOVASTI',
      ),
    );
    expect(result).toBe(true);
  });
  it('returns true when valintatila is VARASIJALTA_HYVAKSYTTY and vastaanotettavuustila is VASTAANOTTANUT_SITOVASTI', () => {
    const result = isEhdollisestiHyvaksyttyVastaanottanutSitovasti(
      mockTulos('VARASIJALTA_HYVAKSYTTY', true, 'VASTAANOTTANUT_SITOVASTI'),
    );
    expect(result).toBe(true);
  });
  it('returns false when valintatila is HYVAKSYTTY and vastaanotettavuustila is EHDOLLISESTI_VASTAANOTTANUT', () => {
    const result = isEhdollisestiHyvaksyttyVastaanottanutSitovasti(
      mockTulos('HYVAKSYTTY', true, 'EHDOLLISESTI_VASTAANOTTANUT'),
    );
    expect(result).toBe(true);
  });
});

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

describe('getAlemmatHyvaksytyt', () => {
  it('palauttaa alemman hyväksytyn hakukohteen', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: 'HYVAKSYTTY',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: 'HYVAKSYTTY',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          valintatila: 'HYLATTY',
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
        {
          oid: 'hk3',
          nimi: { fi: 'Hakukohde 3' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getAlemmatHyvaksytyt('hk1', application);

    expect(result).toHaveLength(1);
    expect(result[0]?.oid).toBe('hk2');
  });

  it('palauttaa kaikki alemmat hyväksytyt hakukohteet', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: 'VARALLA',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: 'HYVAKSYTTY',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          valintatila: 'HYVAKSYTTY',
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
        {
          oid: 'hk3',
          nimi: { fi: 'Hakukohde 3' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getAlemmatHyvaksytyt('hk1', application);

    expect(result).toHaveLength(2);
    expect(result[0]?.oid).toBe('hk2');
    expect(result[1]?.oid).toBe('hk3');
  });

  it('palauttaa kaikkien hyväksyttyjen tilojen alemmat hakukohteet', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: 'VARALLA',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: 'VARASIJALTA_HYVAKSYTTY',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          valintatila: 'HARKINNANVARAISESTI_HYVAKSYTTY',
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
        {
          oid: 'hk3',
          nimi: { fi: 'Hakukohde 3' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getAlemmatHyvaksytyt('hk1', application);

    expect(result).toHaveLength(2);
    expect(result[0]?.oid).toBe('hk2');
    expect(result[1]?.oid).toBe('hk3');
  });

  it('palauttaa tyhjän arrayn jos alemmat eivät ole hyväksyttyjä', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: 'HYVAKSYTTY',
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: 'KESKEN',
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getAlemmatHyvaksytyt('hk1', application);

    expect(result).toHaveLength(0);
  });
});

describe('getVarallaOlevatMuutToiveet', () => {
  it('palauttaa varalla olevat muut hakutoiveet', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: Valintatila.VARALLA,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: Valintatila.VARALLA,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          valintatila: Valintatila.HYLATTY,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
        {
          oid: 'hk3',
          nimi: { fi: 'Hakukohde 3' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getVarallaOlevatMuutToiveet(application, 'hk1');

    expect(result).toHaveLength(1);
    expect(result[0]?.oid).toBe('hk2');
  });

  it('ei palauta hakutoivetta, jonka oid on sama kuin annettu', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: Valintatila.VARALLA,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getVarallaOlevatMuutToiveet(application, 'hk1');

    expect(result).toHaveLength(0);
  });

  it('palauttaa tyhjän arrayn jos muita varalla olevia ei ole', () => {
    const application: Hakemus = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: Valintatila.HYVAKSYTTY,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: Valintatila.HYLATTY,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
      ],
    } as Hakemus;

    const result = getVarallaOlevatMuutToiveet(application, 'hk1');

    expect(result).toHaveLength(0);
  });
});
