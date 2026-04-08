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

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: 'vpc-xxxx' });

    const asset = new s3assets.Asset(this, 'LoadtestAsset', {
      path: '../loadtest',
    });

    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    const instance = new ec2.Instance(this, 'LoadtestInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023 }),
      role,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      associatePublicIpAddress: true,
    });

    // Copy loadtest folder
    instance.userData.addCommands(
      `yum -y install nodejs`,
      `yum -y install https://dl.k6.io/rpm/repo.rpm`,
      `yum -y install k6`,
      `mkdir -p /home/ec2-user/loadtest`,
      `aws s3 cp s3://${asset.s3BucketName}/${asset.s3ObjectKey} /home/ec2-user/loadtest.zip`,
      `unzip /home/ec2-user/loadtest.zip -d /home/ec2-user/loadtest`,
      `chown -R ec2-user:ec2-user /home/ec2-user/loadtest`
    );
  }
}
