import { describe, it, expect } from 'vitest';
import { getVarallaOlevatYlemmatToiveet } from './vastaanotto-utils';
import type { Application } from '@/lib/application-types';
import type { Hakukohde } from '@/lib/kouta-types';
import { Valintatila, type HakutoiveenTulos } from '@/lib/valinta-tulos-types';

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
