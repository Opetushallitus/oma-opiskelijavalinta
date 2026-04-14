#!/bin/bash
set -e

ENVIRONMENT=$1
S3_BUCKET=$2
TEST_TYPE=${3:-load}   # default = load test if not provided

cd /home/ssm-user/loadtest

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULT_FILE="results-${ENVIRONMENT}-${TEST_TYPE}-${TIMESTAMP}.json"

echo "Running k6 load test..."
echo "ENVIRONMENT=$ENVIRONMENT"
echo "TEST_TYPE=$TEST_TYPE"

pnpm install

k6 run script.js \
  -e ENVIRONMENT=${ENVIRONMENT} \
  -e TEST_TYPE=${TEST_TYPE} \
  --out json=${RESULT_FILE}

echo "Uploading results to s3://${S3_BUCKET}/${RESULT_FILE}"
aws s3 cp ${RESULT_FILE} s3://${S3_BUCKET}/${RESULT_FILE}

echo "Load test finished."
