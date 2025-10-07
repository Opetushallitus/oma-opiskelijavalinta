## Oma Opiskelijavalinta

[![Build](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml)

Opiskelijan henkilökohtainen palvelu liittyen opiskelijavalintoihin.

### Lokaali ympäristö

Lokaalin ympäristön käyttöönotto

1. Käynnistä lokaali sovellus ajamalla luokka fi.oph.suorituspalvelu.DevApp. Käynnistyksen
   yhteydessä käynnistetään myös postgres-kanta
2. Mene osoitteeseen: https://localhost:8555/oma-opiskelijavalinta/swagger (uudelleenohjaa kirjautumiseen untuvan cas:iin), kaikkia kutsuja
   pitäisi pystyä kokeilemaan esimerkkiparametreilla
3. Järjestelmän tilaa voi seurata kannasta (salasana on "app"): psql -U app --host localhost --port 55455 -d oma-opiskelijavalinta

#### Palvelimen ja käyttölittymän ajaminen yhdessä

Koko sovelluksen ajaminen yhdessä on toteutettu docker composella.

Docker-compose.sh on kääreskripti, joka mahdollistaa `docker compose`-komennon ajamisen samalla UID:GID-yhdistelmällä kuin host-käyttäjällä, jotta konttien luomien tiedostojen oikeudet ovat vastaavat kuin host-koneella. Voit antaa skriptille samoja komentoriviparametreja kuin `docker compose`-komennolle.

Ensimmäisellä käynnistyskerralla täytyy asentaa tarvittavat paketit Mavenilla ja NPM:llä. Docker-compose.sh-tiedostossa on toteutettu myös Maven ja NPM pakettien asentaminen annettaessa `--build`-optio `up`-komennolle:

`./docker-compose.sh up --build`

Vaihtoehtoisesti voit myös asentaa paketit erikseen Mavenilla ja NPM:llä (suorituspalvelu-ui-hakemistossa).

Jos riippuvuuksia ei ole tarpeen asentaa uudelleen, sovelluksen voi käynnistää nopeammin komennolla:

`./docker-compose.sh up`

Komento käynnistää backendin, käyttöliittymän, postgreSQL-tietokannan ja nginx-proxyn. Ympäristömuuttujat luetaan `.env.docker` ja `.env.docker.local`-tiedostosta. Kopioi itsellesi `.env.docker` tiedosto `.env.docker.local`-tiedostoon ja ylikirjoita haluamasi ympäristömuuttujat (jos esim. haluat ajaa sovellusta jotakin toista ympäristöä vasten).

Sovelluksen käyttöliittymä löytyy käynnistyksen jälkeen osoitteesta http:/localhost:3000/oma-opiskelijavalinta.

### Käyttöliittymäkehitys

#### Playwright-testien ajaminen lokaalisti

Käynnistä ensin käyttöliittymä komennolla:

`npm run dev:test`

Playwright-testejä voi ajaa lokaalisti komennolla:

`npx playwright test --ui`

Tai komentorivillä vain halutulla selaimella:

`npx playwright --project=firefox`

Komennot ajetaan oma-opiskelijavalinta-ui -hakemistossa.