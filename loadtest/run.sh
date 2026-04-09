#!/bin/bash
set -e

ENVIRONMENT=$1
S3_BUCKET=$2

cd /home/ec2-user/loadtest

# Select environment-specific user file
USER_FILE="users-${ENVIRONMENT}.json"
if [ ! -f "$USER_FILE" ]; then
  echo "User file $USER_FILE not found!"
  exit 1
fi

# Timestamp for results
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULT_FILE="results-${ENVIRONMENT}-${TIMESTAMP}.json"

# Run k6
echo "Running k6 load test for environment $ENVIRONMENT..."
pnpm install
k6 run script.ts --out json=${RESULT_FILE}

# Upload results to S3
echo "Uploading results to s3://${S3_BUCKET}/${RESULT_FILE}"
aws s3 cp ${RESULT_FILE} s3://${S3_BUCKET}/${RESULT_FILE}

echo "Load test finished. Results uploaded to S3."
