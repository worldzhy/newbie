import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.stack';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {Util} from '../util';

@Injectable()
export class Network extends BaseProgram {
  private vpcName: string = 'development-vpc';
  private vpcCidrBlock: string = '10.10.0.0/16';
  private numberOfAvailabilityZones: number = 2;

  constructor() {
    super();
    this.initPulumiProgram(this.program);
  }

  setVpcName = (name: string | null) => {
    if (name !== null && String(name).trim() !== '') {
      this.vpcName = name;
    }
    return this;
  };

  setVpcCidrBlock = (vpcCidrBlock: string | null) => {
    if (vpcCidrBlock !== null && String(vpcCidrBlock).trim() !== '') {
      this.vpcCidrBlock = vpcCidrBlock;
    }
    return this;
  };

  setNumberOfAvailabilityZones = (num: number | null) => {
    if (num !== null) {
      this.numberOfAvailabilityZones = num;
    }
    return this;
  };

  program = async () => {
    // Allocate development, production and management VPCs.
    const vpc = new awsx.ec2.Vpc(this.vpcName, {
      cidrBlock: this.vpcCidrBlock,
      numberOfAvailabilityZones: this.numberOfAvailabilityZones,
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
    const vpcInternetGateway = new aws.ec2.InternetGateway(
      'mgmt-vpc-internet-gateway',
      {vpcId: vpc.vpcId}
    );

    // Allocate EC2 security group.
    const ec2SecurityGroup = Util.generateSecurityGroupForEC2(
      this.vpcName + '-ec2-sg',
      vpc.vpcId
    );

    // Allocate RDS security group.
    const rdsSecurityGroup = Util.generateSecurityGroupForRDS(
      this.vpcName + '-rds-sg',
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

  /* End */
}
