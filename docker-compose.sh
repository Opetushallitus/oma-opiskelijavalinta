#!/bin/bash

# Install dependencies and maven artifacts if --build option is provided
if [[ " $* " == *--build* ]]; then
  mvn install -DskipTests
  cd oma-opiskelijavalinta-ui && npm i --frozen-lockfile
fi

export USERID=$(id -u)
export GROUPID=$(id -g)
docker compose $*
