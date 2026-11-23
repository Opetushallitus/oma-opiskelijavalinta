# Oma Opiskelijavalinta

[![Build](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml)

Opiskelijan henkilökohtainen palvelu liittyen opiskelijavalintoihin.

## Lokaaliympäristön asentaminen

1. Aja juurihakemistossa `./generate_certs.sh` luodaksesi certifikaatit lokaaliin käyttöön.
2. Luo .gitignoressa oleva `application-dev.yml` tiedosto `test/resources`-kansioon ja kopioi sinne samassa kansiossa oleva `application.yml.template` pohjaksi.
3. Aseta muuttujien arvot, mitkä ovat merkattu tekstillä `PLACEHOLDER_PAKKOLLINEN`, haluamasi ympäristön parametreista tai salaisuuksista. Pohja on tehty hahtuva-ympäristöä vasten.
   1. Parametrien/salaisuuksien arvot saa haettu ympäristön Parameter Store:sta AWS:stä, tai käyttäen `cloud-base`-repon olevalla skriptillä `config.py`. Salaisuuksien nimet löydät (toistaiseksi) [täältä](https://github.com/Opetushallitus/cloud-base/blob/master/aws/templates/stacks.json#L1267-L1310) (parametrin `oma-opiskelijavalinta.cas.username` nimi ei ole listattu täältä, mutta löytyy Parameter Store:sta).
4. Luo uusi tiedosto polkuun `oma-opiskelijavalinta-ui/env.development.local`, ja kopioi arvot `oma-opiskelijavalinta-ui/env.example`-tiedostosta. Oletusarvot ovat hahtuva-ympäristöä vasten, muuta näitä jos ajaat toista ympäristöä vasten.
5. Jos ajaat muuta ympäristö vasten kun hahtuvaa, aseta ympäristömuuttuja `DOMAIN`, esim `DOMAIN=untuvaopintopolku.fi`.

HUOM! Jos ajaat toista ympäristöä vasten mitä `application.yml.template` on, muista myös päivittää parametrin `spring.security.ouath2.resourceserver.jwt.issuer-uri` arvon! Jokaisen ympäristön arvot ovat:

```yml
# Hahtuva
issuer-uri: https://hahtuva.otuva.opintopolku.fi/kayttooikeus-service

# Untuva
issuer-uri: https://dev.otuva.opintopolku.fi/kayttooikeus-service

# Pallero/QA
issuer-uri: https://qa.otuva.opintopolku.fi/kayttooikeus-service
```

## Backendin ja tietokannan käynnistäminen

1. Käynnistä lokaali sovellus ajamalla luokka `fi.oph.suorituspalvelu.DevApp`. Käynnistyksen yhteydessä käynnistetään myös postgres-kanta - TAI VAIHTOEHTOISESTI Käynnistä postgres-kanta erikseen komennolla `docker run --name oma-opiskelijavalinta-postgres -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -e POSTGRES_DB=test -p 55455:5432 -d postgres:17` ja käynnistä `fi.oph.suorituspalvelu.DevApp` ympäristömuuttujalla `NO_DB=true`
2. Mene osoitteeseen: <https://localhost:8555/oma-opiskelijavalinta/swagger>, sinut uudelleenohjataan kirjautumaan oletuksena hahtuvan CAS:iin, tätä voi muuttaa ympäristömuuttujalla `DOMAIN`. Kaikkia kutsuja pitäisi pystyä kokeilemaan esimerkkiparametreilla
3. Järjestelmän tilaa voi seurata kannasta (salasana on "app"): `psql -U app --host localhost --port 55455 -d omaopiskelijavalinta`

### Testien ajaminen

Yksikkö- ja integraatiotestit voi ajaa suorittamalla:

`mvn test`

Yksittäisen testiluokan ajaminen submoduulista:

`mvn test -Dtest=HealthCheckIntegraatioTest`

## Käyttöliittymäkehitys

Käyttöliittymää ajetaan lokaalia backendiä ja tietokantaa, eli nämä pitää olla käynnissä samaan aikaan.

### Käynnistäminen

1. Mene polkuun `oma-opiskelijavalinta-ui`
2. Asenna riippuvuudet ajamalla `pnpm i`
3. Käynnistä ajamalla `pnpm run dev`
4. Mene osoitteeseen <https://localhost:3777/oma-opiskelijavalinta>

### Yksikkötestien ajaminen

Tapahtuu komennolla:

`pnpm test`

### Playwright-testien ajaminen lokaalisti

Käynnistä ensin käyttöliittymä komennolla:

`pnpm run dev:test`

Playwright-testejä voi ajaa lokaalisti komennolla:

`pnpm playwright test --ui`

Tai komentorivillä vain halutulla selaimella:

`pnpm playwright test --project=firefox`

Komennot ajetaan oma-opiskelijavalinta-ui -hakemistossa.

## Tuotantokonfiguraatiot

Jos suorituskykyä varten tarvitsee säätää http-clientien thread poolin kokoa, timeoutteja tai muita vastaavia, oletuskonfiguraation voi yliajaa asettamalla ympäristömuuttujan tai JVM args

esim.

`HTTP_CLIENT_MAX_CONNECTIONS=500
THREADPOOL_HTTP_QUEUE_SIZE=1000
CLIENTS_TIMEOUT_KOUTA=8`

tai

`-Dhttp.client.max-connections=500`

Http clientin MaxConnectionsPerHost ja thread poolin core+max pool size pitää olla oikeassa suhteessa toisiinsa (max connections ei saisi olla pienempi kuin poolin koko).
