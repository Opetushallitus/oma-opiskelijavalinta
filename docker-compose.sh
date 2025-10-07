#!/bin/bash

# Install dependencies and maven artifacts if --build option is provided
if [[ " $* " == *--build* ]]; then
  mvn install -DskipTests
  cd oma-opiskelijavalinta-ui && pnpm i --frozen-lockfile
fi

export USERID=$(id -u)
export GROUPID=$(id -g)
docker compose $*
