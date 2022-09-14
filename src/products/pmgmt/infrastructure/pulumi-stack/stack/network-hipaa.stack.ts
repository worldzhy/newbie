import {Injectable} from '@nestjs/common';
import {PulumiStackType} from '@prisma/client';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {getAwsConfig} from '../../../../../_config/_aws.config';
import {
  buildResourceOptions,
  generateSecurityGroupForEC2,
  generateSecurityGroupForRDS,
} from '../pulumi-stack.util';

@Injectable()
export class NetworkHipaa_Stack {
  static getStackParams() {
    return {
      [PulumiStackType.AWS_ECS]: {
        vpcName: 'elastic-container-cluster',
        vpcCidrBlock: '10.10.0.0/16',
        numberOfAvailabilityZones: 2,
      },
      [PulumiStackType.AWS_EKS]: {
        vpcName: 'elastic-server-cluster',
        vpcCidrBlock: '10.20.0.0/16',
        numberOfAvailabilityZones: 2,
      },
    };
  }

  static checkStackParams(params: object) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return [
      'vpcId',
      'privateSubnetIds',
      'publicSubnetIds',
      'ec2SecurityGroup',
      'rdsSecurityGroup',
    ];
  }

  static getStackProgram =
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
        vpcName = 'vpc-development';
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
      let uniqueResourceName = `${vpcName}-`;
      const vpc = new awsx.ec2.Vpc(
        uniqueResourceName,
        {
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
        },
        buildResourceOptions(getAwsConfig().region!)
      );

      uniqueResourceName = 'igw';
      new aws.ec2.InternetGateway(
        uniqueResourceName,
        {
          vpcId: vpc.vpcId,
        },
        buildResourceOptions(getAwsConfig().region!)
      );

      // Allocate EC2 security group.
      const ec2SecurityGroup = generateSecurityGroupForEC2(
        vpcName + '-ec2-sg',
        vpc.vpcId
      );

      // Allocate RDS security group.
      const rdsSecurityGroup = generateSecurityGroupForRDS(
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
}
