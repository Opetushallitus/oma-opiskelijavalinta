import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { Vpc } from "aws-cdk-lib/aws-ec2";

interface LoadtestStackProps extends cdk.StackProps {
  environmentName: string;
}

export class LoadtestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LoadtestStackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'MyExistingVPC', {vpcName: `opintopolku-vpc-${props!.environmentName}`})

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
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      associatePublicIpAddress: false,
      ssmSessionPermissions: true,
      instanceName: `${props.environmentName}-loadtest-instance`,
    });

    const resultsBucket = new s3.Bucket(this, 'ResultsBucket', {
      bucketName: 'oma-opiskelijavalinta-loadtest',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    instance.userData.addCommands(
      // system deps
      'dnf install -y nodejs unzip',
      'npm install -g pnpm',
      'dnf install -y https://dl.k6.io/rpm/repo.rpm',
      'dnf install -y k6',

      // download loadtest bundle
      `aws s3 cp s3://${asset.s3BucketName}/${asset.s3ObjectKey} /tmp/loadtest.zip`,

      // unzip to temp (safe as root)
      'rm -rf /tmp/loadtest',
      'unzip /tmp/loadtest.zip -d /tmp/loadtest',

      // move to final location
      'rm -rf /home/ssm-user/loadtest',
      'mv /tmp/loadtest /home/ssm-user/loadtest',

      // FIX OWNERSHIP (this is the key line)
      'chown -R ssm-user:ssm-user /home/ssm-user/loadtest',

      // permissions
      'chmod +x /home/ssm-user/loadtest/run.sh'
    );

    // Optional: expose S3 asset info as CloudFormation output
    new cdk.CfnOutput(this, 'LoadtestAssetBucket', { value: asset.s3BucketName });
    new cdk.CfnOutput(this, 'LoadtestAssetKey', { value: asset.s3ObjectKey });
  }
}
