## Oma Opiskelijavalinta

[![Build](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml/badge.svg)](https://github.com/Opetushallitus/oma-opiskelijavalinta/actions/workflows/build.yml)

Opiskelijan henkilökohtainen palvelu liittyen opiskelijavalintoihin.

### Taustapalvelu

Mene ssh:lla loadtest-konttiin:
loadtest-hakemistossa `export AWS_PROFILE=oph-dev`
ja `./ssh.sh pallero`

Kontissa mene loadtest-hakemistoon ja aja skripti, parematrina ympäristö s3 bucketin nimi ja testiskenaariojoka ajaa loadtestit oma-opiskelijavalinta-loadtest -kansiossa olevilla testitiedostoilla:
- smoke
- baseline
- stress
- spike
- breakpoint

`cd /home/ssm-user/loadtest`
`./run.sh pallero oma-opiskelijavalinta-loadtest smoke`
