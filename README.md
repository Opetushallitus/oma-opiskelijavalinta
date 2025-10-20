## Oma Opiskelijavalinta

[![Build](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml)

Opiskelijan henkilökohtainen palvelu liittyen opiskelijavalintoihin.

### Taustapalvelu

Aja juurihakemistossa `./generate_certs.sh` luodaksesi certifikaatit lokaaliin käyttöön.

#### Käynnistäminen

1. Käynnistä lokaali sovellus ajamalla luokka fi.oph.suorituspalvelu.DevApp. Käynnistyksen
   yhteydessä käynnistetään myös postgres-kanta
2. Mene osoitteeseen: https://localhost:8555/oma-opiskelijavalinta/swagger (uudelleenohjaa kirjautumiseen untuvan cas:iin), kaikkia kutsuja
   pitäisi pystyä kokeilemaan esimerkkiparametreilla
3. Järjestelmän tilaa voi seurata kannasta (salasana on "app"): psql -U app --host localhost --port 55455 -d omaopiskelijavalinta

#### Testien ajaminen

Yksikkö- ja integraatiotestit voi ajaa suorittamalla:

`mvn test`

Yksittäisen testiluokan ajaminen submoduulista:

`mvn test -Dtest=HealthCheckIntegraatioTest`

### Käyttöliittymäkehitys

#### Yksikkötestien ajaminen

Tapahtuu komennolla:

`npm test`

#### Playwright-testien ajaminen lokaalisti

Käynnistä ensin käyttöliittymä komennolla:

`npm run dev:test`

Playwright-testejä voi ajaa lokaalisti komennolla:

`npx playwright test --ui`

Tai komentorivillä vain halutulla selaimella:

`npx playwright --project=firefox`

Komennot ajetaan oma-opiskelijavalinta-ui -hakemistossa.
