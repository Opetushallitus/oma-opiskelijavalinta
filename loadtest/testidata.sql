
select distinct hakemus_oid from valinnantilat where hakukohde_oid in (select hakukohde_oid from hakukohteet where haku_oid='1.2.246.562.29.00000000000000056840');
SELECT s.token
FROM secure_link s
         JOIN temp_hakemus_oids t
              ON s.metadata->>'hakemusOid' = t.hakemus_oid
WHERE s.valid_until > NOW();
-- 2 aste 2024 1.2.246.562.29.00000000000000038404
-- 2 aste 2025 1.2.246.562.29.00000000000000056840
-- kk2 2025 1.2.246.562.29.00000000000000054531
-- onko tuloksia tsekkaus:
-- select count(distinct hakemus_oid) from valinnantilat where hakukohde_oid in (select hakukohde_oid from hakukohteet where haku_oid='1.2.246.562.29.00000000000000056840')
