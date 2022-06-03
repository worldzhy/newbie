import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {PulumiUtil} from '../_util';

export const createNetworkStack =
  (params: {
    vpcName?: string;
    vpcCidrBlock?: string;
    numberOfAvailabilityZones?: number;
  }) =>
  async () => {
    let vpcName = params.vpcName;
    let vpcCidrBlock = params.vpcCidrBlock;
    let numberOfAvailabilityZones = params.numberOfAvailabilityZones;

    // [step 1] Guard statement
    if (vpcName === undefined || vpcName === null || vpcName.trim() === '') {
      vpcName = 'development-vpc';
    }
    if (
      vpcCidrBlock === undefined ||
      vpcCidrBlock === null ||
      vpcCidrBlock.trim() === ''
    ) {
      vpcCidrBlock = '10.10.0.0/16';
    }

    if (
      numberOfAvailabilityZones === undefined ||
      numberOfAvailabilityZones === null
    ) {
      numberOfAvailabilityZones = 2;
    }

    // Allocate development, production and management VPCs.
    const vpc = new awsx.ec2.Vpc(vpcName, {
      cidrBlock: vpcCidrBlock,
      numberOfAvailabilityZones: numberOfAvailabilityZones,
      subnetSpecs: [
        {
          type: 'Private',
          cidrMask: 22,
        },
        {
          type: 'Public',
          cidrMask: 24,
        },
      ],
      natGateways: {
        strategy: awsx.ec2.NatGatewayStrategy.OnePerAz,
      },
    });
    const vpcInternetGateway = new aws.ec2.InternetGateway(vpcName + '-igw', {
      vpcId: vpc.vpcId,
    });

    // Allocate EC2 security group.
    const ec2SecurityGroup = PulumiUtil.generateSecurityGroupForEC2(
      vpcName + '-ec2-sg',
      vpc.vpcId
    );

    // Allocate RDS security group.
    const rdsSecurityGroup = PulumiUtil.generateSecurityGroupForRDS(
      vpcName + '-rds-sg',
      vpc.vpcId,
      [ec2SecurityGroup.id]
    );

    return {
      vpcId: vpc.vpcId,
      privateSubnetIds: vpc.privateSubnetIds,
      publicSubnetIds: vpc.publicSubnetIds,
      ec2SecurityGroup: ec2SecurityGroup.id,
      rdsSecurityGroup: rdsSecurityGroup.id,
    };
  };
