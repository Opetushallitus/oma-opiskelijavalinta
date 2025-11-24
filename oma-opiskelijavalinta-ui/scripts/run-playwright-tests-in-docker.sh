#!/bin/bash

PLAYWRIGHT=$(pnpm list -D "*playwright*test*" | tail -1)
PLAYWRIGHT_VERSION=$(echo "${PLAYWRIGHT##* }")
echo ${PLAYWRIGHT_VERSION}
$PNPM_HOME="/pnpm"
$PATH="$PNPM_HOME:$PATH"
docker run --mount type=bind,source=$PWD,target=/app --user "$(id -u):$(id -g)" -w /app --ipc=host --net=host mcr.microsoft.com/playwright:v$PLAYWRIGHT_VERSION npx playwright test --ignore-engines $@