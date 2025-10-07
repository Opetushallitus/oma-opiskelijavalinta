#!/bin/bash
GIT_ROOT=$(git rev-parse --show-toplevel)

mkdir -p $GIT_ROOT/oma-opiskelijavalinta-service/src/main/resources/static/
cp $GIT_ROOT/oma-opiskelijavalinta-ui/build/client/*.html $GIT_ROOT/oma-opiskelijavalinta-service/src/main/resources/static/
cp -R $GIT_ROOT/oma-opiskelijavalinta-ui/build/client/oma-opiskelijavalinta/assets $GIT_ROOT/oma-opiskelijavalinta-service/src/main/resources/static/