## Kuormitustestaus

Kuormistustestit ajetaan AWS:n EC2 virtuaalikoneella, joka pystytetään tarvittaessa ja ajetaan alas testien jälkeen.
Testin tulokset siirretään testiajon jälkeen S3-buckettiin, josta ne voidaan hakea ja analysoida.

Testiskenaariot:
- smoke: ajetaan skenaario muutamalla käyttäjällä niin voi todentaa että skripti ja palvelu toimii
- baseline: ajetaan kohtuullisella kuormalla, ja voi todentaa että palvelu toimii odotetusti
- stress: ajetaan suuremmalla kuormalla
- spike: ajetaan äkillisellä suurella kuormalla
- breakpoint: ajetaan kuormaa, joka on riittävä aiheuttamaan palvelun kaatumisen jotta voidaan todentaa mikä on maksimikuorma mitä palvelu kestää

Testidata on users-ympäristö.json
- perusopetuksen jälkeisen yhteishaun käyttäjien voimassa olevia kirjautumistokeneita
ja kk-users-ympäristö.json 
- kk-haun käyttäjien voimassa olevia kirjautumistokeneita

Toisen asteen käyttäjille tehdään testiskriptissä myös vastaanotto ja ilmoittautuminen. 
Kk-käyttäjät ovat lisätrafiikkia jossa on pelkkiä tietojen hakuja. 

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
loadtest-hakemistossa `export AWS_PROFILE=oph-dev`
ja `./ssh.sh pallero`

Kontissa mene loadtest-hakemistoon ja aja skripti, 
parametrina ympäristö, s3 bucketin nimi (oma-opiskelijavalinta-loadtest) 
ja testiskenaario, joka voi olla yksi seuraavista:
- smoke
- baseline
- stress
- spike
- breakpoint

`cd /home/ssm-user/loadtest`
`./run.sh pallero oma-opiskelijavalinta-loadtest smoke`

Lopuksi aja loadtest-stack alas ajamalla github action "Destroy loadtest stack" ja valitsemalla ympäristö, jossa testi ajettiin.
Tämä poistaa EC2-instanssin ja S3-bucketin, joten testitulokset kannattaa hakea talteen ennen tätä.
