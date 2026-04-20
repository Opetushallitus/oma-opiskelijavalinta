if [ -z "$1" ]; then
  echo "Usage: $0 <environment>"
  exit 1
fi

ENVIRONMENT=$1
INSTANCE_NAME="${ENVIRONMENT}-loadtest-instance"

INSTANCE_ID=$(aws ec2 describe-instances \
  --region eu-west-1 \
  --filters "Name=tag:Name,Values=${INSTANCE_NAME}" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text)

if [ "$INSTANCE_ID" == "None" ] || [ -z "$INSTANCE_ID" ]; then
  echo "Error: No running instance found for ${INSTANCE_NAME}"
  exit 1
fi

echo "Connecting to instance $INSTANCE_ID ($INSTANCE_NAME)..."

# Start SSM session (interactive shell)
aws ssm start-session \
  --region eu-west-1 \
  --target "$INSTANCE_ID"
