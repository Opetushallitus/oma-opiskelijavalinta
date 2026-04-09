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
    });

    // Only install dependencies
    instance.userData.addCommands(
      'dnf install -y nodejs unzip',
      'npm install -g pnpm',
      'dnf install -y https://dl.k6.io/rpm/repo.rpm',
      'dnf install -y k6',
      'mkdir -p /home/ec2-user/loadtest'
    );
  }
}
