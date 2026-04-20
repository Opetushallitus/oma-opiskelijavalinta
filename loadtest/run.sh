#!/bin/bash
set -e

ENVIRONMENT=$1
S3_BUCKET=$2
TEST_TYPE=${3:-load}   # default = load test if not provided

cd /home/ssm-user/loadtest

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SUMMARY_FILE="summary-${ENVIRONMENT}-${TEST_TYPE}-${TIMESTAMP}.json"
LOG_FILE="k6-${ENVIRONMENT}-${TEST_TYPE}-${TIMESTAMP}.log"

echo "Running k6 load test..."
echo "ENVIRONMENT=$ENVIRONMENT"
echo "TEST_TYPE=$TEST_TYPE"

pnpm install

k6 run script.js \
  -e ENVIRONMENT=${ENVIRONMENT} \
  -e TEST_TYPE=${TEST_TYPE} \
  --summary-export=${SUMMARY_FILE} \
  | tee ${LOG_FILE}

echo "Uploading results to s3://${S3_BUCKET}/"
aws s3 cp ${SUMMARY_FILE} s3://${S3_BUCKET}/${SUMMARY_FILE}
aws s3 cp ${LOG_FILE} s3://${S3_BUCKET}/${LOG_FILE}

echo "Load test finished."
