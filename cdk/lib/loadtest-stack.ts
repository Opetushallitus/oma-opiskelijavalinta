import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';

interface LoadtestStackProps extends cdk.StackProps {
  environmentName: string;
}

export class LoadtestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LoadtestStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 1 });

    // Upload local loadtest folder to S3
    const asset = new s3assets.Asset(this, 'LoadtestAsset', {
      path: '../loadtest',
    });

    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'), // run.sh uploads results
      ],
    });

    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      }),
      role,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      associatePublicIpAddress: true,
      ssmSessionPermissions: true,
      instanceName: `${props.environmentName}-loadtest-instance`,
    });

    instance.userData.addCommands(
      // Install deps
      'dnf install -y nodejs unzip',
      'npm install -g pnpm',
      'dnf install -y https://dl.k6.io/rpm/repo.rpm',
      'dnf install -y k6',

      // Create folder
      'mkdir -p /home/ssm-user/loadtest',

      // Download loadtest bundle from CDK asset bucket
      `aws s3 cp s3://${asset.s3BucketName}/${asset.s3ObjectKey} /home/ssm-user/loadtest.zip`,

      // Unzip into folder
      'unzip /home/ssm-user/loadtest.zip -d /home/ssm-user/loadtest',

      // Fix permissions for SSM user
      'chown -R ssm-user:ssm-user /home/ssm-user/loadtest',
      'chmod +x /home/ssm-user/loadtest/run.sh'
    );

    // Optional: expose S3 asset info as CloudFormation output
    new cdk.CfnOutput(this, 'LoadtestAssetBucket', { value: asset.s3BucketName });
    new cdk.CfnOutput(this, 'LoadtestAssetKey', { value: asset.s3ObjectKey });
  }
}
