## Kuormitustestaus

Kuormitustestit ajetaan AWS:n EC2 virtuaalikoneella, joka pystytetään tarvittaessa ja ajetaan alas testien jälkeen.
Testin tulokset siirretään testiajon jälkeen S3-buckettiin, josta ne voidaan hakea ja analysoida.

### Testiskenaariot

- smoke: ajetaan skenaario muutamalla käyttäjällä niin voidaan todentaa että skripti ja palvelu toimii
- smoke-spike: ajetaan skenaario muutaman minuutin ajan kohtalaisella kuormalla
- baseline: ajetaan 20min kohtuullisella kuormalla, niin voidaan todentaa että palvelu toimii odotetusti
- overnight: ajetaan 8h kohtuullisella kuormalla, niin voidaan todentaa että palvelu toimii odotetusti pidemmällä aikavälillä
- spike: ajetaan äkillisellä suurella kuormalla
- stress: ajetaan suuremmalla kuormalla
- breakpoint: ajetaan kuormaa, joka on riittävä aiheuttamaan palvelun kaatumisen jotta voidaan todentaa mikä on maksimikuorma mitä palvelu kestää

### Testidata

Testidata on käyttäjien kirjautumis-tokeneita json-tiedostossa:

- users-ympäristö.json
  - perusopetuksen jälkeisen yhteishaun käyttäjien voimassa olevia kirjautumistokeneita
- kk-users-ympäristö.json
  - kk-haun käyttäjien voimassa olevia kirjautumistokeneita

Toisen asteen käyttäjille tehdään testiskriptissä myös vastaanotto ja ilmoittautuminen. 
Jotta käyttäjillä on paikka vastaanotettavissa, täytyy tarvittaessa poistaa aikaisemmat vastaanotot
skriptillä [clear_vastaanottodata.sql](clear_vastaanottodata.sql), joka ajaa delete-queryt valintarekisterikantaan.

Jos vastaanotto-deadline on mennyt, täytyy tarvitaessa poistaa tulokset, ks.
[skripti](https://wiki.eduuni.fi/pages/viewpage.action?pageId=158142029&spaceKey=ophPPK&title=Tulosdatan%2Bhallinta%2Bvalintarekisteriss%C3%A4#Tulosdatanhallintavalintarekisteriss%C3%A4-Haunsijoitteluidentulostenpoisto(poistaamy%C3%B6svastaanototjailmoittautumiset))
ajaa uudestaan sijoittelu ja julkaista tulokset massana suoraan kantaan ks.
[skripti](https://wiki.eduuni.fi/spaces/ophPPK/pages/158142029/Tulosdatan+hallinta+valintarekisteriss%C3%A4#Tulosdatanhallintavalintarekisteriss%C3%A4-Haunvalintaesitystenhyv%C3%A4ksynt%C3%A4jatulostenjulkaisu)

Kk-käyttäjät ovat lisätrafiikkia jossa on pelkkiä tietojen hakuja ja niiden osalta riittää että kirjautumis-token on voimassa. 

HUOM! Toistaiseksi testidataa (voimassa olevia kirjautumis-tokeneita 2. asteen yhteishakuun ja johonkin kk-hakuun) on generoitu testidatatiedostoihin vain pallerolle.

### Testin ajo lokaalisti

Smoketestin voi kokeilla lokaalisti loadtest-hakemistossa:
`run script.js \
  -e ENVIRONMENT=${ENVIRONMENT} \
  -e TEST_TYPE=${TEST_TYPE} \
  --out json=${RESULT_FILE}`

Suuremmalla kuormalla testit vaativat AWS-ympäristön, ks. alla.

### Testin ajo aws-ympäristössä

Ennen testiajoa tee tarvittaessa vastaanotto- ja ilmoittautumistietojen poisto testihaulle:
aja valintarekisterikantaan tiedoston clear_vastaanottodata.sql delete-queryt testaamasi haun oidilla

Pystytä stack ajamalla github action "Deploy loadtest stack" ja valitsemalla ympäristö, jossa testi ajetaan. 
Tämä luo EC2-instanssin ja S3-bucketin, johon testitulokset tallennetaan.

Loggaa ssh:lla EC2-instanssiin:
lokaalirepon loadtest-hakemistossa `export AWS_PROFILE=oph-dev`
ja `./ssh.sh pallero`


Kontissa mene /home/ssm-user/loadtest-hakemistoon ja aja skripti.

Jos deploy ei ole saanut luotua hakemistoa, se löytyy todennäköisesti /tmp/loadtest alta.
Jos hakemistolle on jäänyt root-permissiotat, aja `sudo chown -R ssm-user:ssm-user /home/ssm-user/loadtest`.

Skriptin käynnistyksessä anna parametrina ympäristö, s3 bucketin nimi (oma-opiskelijavalinta-loadtest) 
ja testiskenaario, joka voi olla yksi seuraavista:
- smoke
- smoke-spike
- baseline
- overnight
- spike
- stress
- breakpoint

Eli esim.
`cd /home/ssm-user/loadtest`
`./run.sh pallero oma-opiskelijavalinta-loadtest smoke`

Pitemmissä skripteissä kannattaa käynnistää ajo screenissä, jotta skriptin ajo ei katkea vaikka ssh-yhteys katkeaisi.

Lopuksi aja loadtest-stack alas ajamalla github action "Destroy loadtest stack" ja valitsemalla ympäristö, jossa testi ajettiin.
Tämä poistaa EC2-instanssin ja S3-bucketin, joten testitulokset kannattaa hakea talteen ennen tätä.
