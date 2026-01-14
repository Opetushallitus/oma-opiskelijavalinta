import { describe, it, expect } from 'vitest';
import {
  getVarallaOlevatYlemmatToiveet,
  getAlemmatVastaanotot,
  hasAlemmatVastaanotot,
} from './vastaanotto-utils';
import type { Application } from '@/lib/application-types';
import type { Hakukohde } from '@/lib/kouta-types';
import {
  Valintatila,
  VastaanottoTila,
  type HakutoiveenTulos,
} from '@/lib/valinta-tulos-types';

describe('getVarallaOlevatYlemmatToiveet', () => {
  const mockHakukohde1: Hakukohde = {
    oid: 'hk1',
    nimi: { fi: 'Hakukohde 1' },
  } as Hakukohde;

  const mockHakukohde2: Hakukohde = {
    oid: 'hk2',
    nimi: { fi: 'Hakukohde 2' },
  } as Hakukohde;

  const mockHakukohde3: Hakukohde = {
    oid: 'hk3',
    nimi: { fi: 'Hakukohde 3' },
  } as Hakukohde;

  it('palauttaa tyhjän arrayn jos ylemmät hakutoiveet eivät ole varalla', () => {
    const application: Application = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: Valintatila.HYVAKSYTTY,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: Valintatila.HYLATTY,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          valintatila: Valintatila.HYVAKSYTTY,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [mockHakukohde1, mockHakukohde2, mockHakukohde3],
    } as Application;

    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde1)).toEqual(
      [],
    );
    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde2)).toEqual(
      [],
    );
    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde3)).toEqual(
      [],
    );
  });

  it('palauttaa ylemmät hakutoiveet jotka ovat varalla', () => {
    const application: Application = {
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
          valintatila: Valintatila.HYVAKSYTTY,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [mockHakukohde1, mockHakukohde2, mockHakukohde3],
    } as Application;

    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde1)).toEqual(
      [],
    );
    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde2)).toEqual(
      [mockHakukohde1],
    );
    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde3)).toEqual(
      [mockHakukohde1, mockHakukohde2],
    );
  });

  it('palauttaa vain ylemmät hakutoiveet jotka ovat varalla', () => {
    const application: Application = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          valintatila: Valintatila.HYVAKSYTTY,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          valintatila: Valintatila.VARALLA,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          valintatila: Valintatila.HYVAKSYTTY,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [mockHakukohde1, mockHakukohde2, mockHakukohde3],
    } as Application;

    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde1)).toEqual(
      [],
    );
    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde2)).toEqual(
      [],
    );
    expect(getVarallaOlevatYlemmatToiveet(application, mockHakukohde3)).toEqual(
      [mockHakukohde2],
    );
  });
});

describe('getAlemmatVastaanotot', () => {
  it('palauttaa alemman vastaanoton', () => {
    const hakukohde: Hakukohde = {
      oid: 'hk2',
      nimi: { fi: 'Hakukohde 2' },
    } as Hakukohde;

    const application: Application = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          vastaanottotila: VastaanottoTila.KESKEN,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          vastaanottotila: VastaanottoTila.KESKEN,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        {
          oid: 'hk1',
          nimi: { fi: 'Hakukohde 1' },
        } as Hakukohde,
        hakukohde,
        {
          oid: 'hk3',
          nimi: { fi: 'Hakukohde 3' },
        } as Hakukohde,
      ],
    } as Application;

    const alemmatVastaanotot = getAlemmatVastaanotot(hakukohde, application);
    expect(alemmatVastaanotot).toHaveLength(1);
    expect(alemmatVastaanotot?.[0]?.oid).toBe('hk3');
    expect(hasAlemmatVastaanotot(hakukohde, application)).toBe(true);
  });

  it('palauttaa alemmat vastaanotot oikein', () => {
    const hakukohde: Hakukohde = {
      oid: 'hk1',
      nimi: { fi: 'Hakukohde 1' },
    } as Hakukohde;

    const application: Application = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          vastaanottotila: VastaanottoTila.KESKEN,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk3',
          vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
        {
          oid: 'hk3',
          nimi: { fi: 'Hakukohde 3' },
        } as Hakukohde,
      ],
    } as Application;

    const alemmatVastaanotot = getAlemmatVastaanotot(hakukohde, application);
    expect(alemmatVastaanotot).toHaveLength(2);
    expect(alemmatVastaanotot?.[0]?.oid).toBe('hk2');
    expect(alemmatVastaanotot?.[1]?.oid).toBe('hk3');
    expect(hasAlemmatVastaanotot(hakukohde, application)).toBe(true);
  });

  it('palauttaa tyhjän arrayn jos ei ole alempia vastaanottoja', () => {
    const hakukohde: Hakukohde = {
      oid: 'hk1',
      nimi: { fi: 'Hakukohde 1' },
    } as Hakukohde;

    const application: Application = {
      hakemuksenTulokset: [
        {
          hakukohdeOid: 'hk1',
          vastaanottotila: VastaanottoTila.KESKEN,
        } as HakutoiveenTulos,
        {
          hakukohdeOid: 'hk2',
          vastaanottotila: VastaanottoTila.KESKEN,
        } as HakutoiveenTulos,
      ],
      hakukohteet: [
        hakukohde,
        {
          oid: 'hk2',
          nimi: { fi: 'Hakukohde 2' },
        } as Hakukohde,
      ],
    } as Application;

    expect(getAlemmatVastaanotot(hakukohde, application)).toHaveLength(0);
    expect(hasAlemmatVastaanotot(hakukohde, application)).toBe(false);
  });
});
