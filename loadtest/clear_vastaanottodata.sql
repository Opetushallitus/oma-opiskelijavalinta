delete
from vastaanotot
where hakukohde in
      (select hakukohde_oid from hakukohteet where haku_oid = '1.2.246.562.29.00000000000000038404');

delete
from ilmoittautumiset
where hakukohde in
      (select hakukohde_oid from hakukohteet where haku_oid = '1.2.246.562.29.00000000000000038404');
