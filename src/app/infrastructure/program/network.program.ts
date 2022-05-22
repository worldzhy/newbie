import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.program';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {Util} from '../util';

@Injectable()
export class Network extends BaseProgram {
  private vpcCidrBlockDev: string = '10.20.0.0/16';
  private vpcCidrBlockProd: string = '10.10.0.0/16';
  private vpcCidrBlockMgmt: string = '10.0.0.0/16';
  private numberOfAvailabilityZones: number = 2;

  constructor() {
    super();
    this.initPulumiProgram(this.program);
  }

  setVpcCidrBlockDev = (vpcCidrBlock: string) => {
    this.vpcCidrBlockDev = vpcCidrBlock;
    return this;
  };
  setVpcCidrBlockProd = (vpcCidrBlock: string) => {
    this.vpcCidrBlockProd = vpcCidrBlock;
    return this;
  };
  setVpcCidrBlockMgmt = (vpcCidrBlock: string) => {
    this.vpcCidrBlockMgmt = vpcCidrBlock;
    return this;
  };
  setNumberOfAvailabilityZones = (num: number) => {
    this.numberOfAvailabilityZones = num;
    return this;
  };

  program = async () => {
    // Allocate development, production and management VPCs.
    const devVpc = new awsx.ec2.Vpc('development-vpc', {
      cidrBlock: this.vpcCidrBlockDev,
      numberOfAvailabilityZones: this.numberOfAvailabilityZones,
      numberOfNatGateways: 1,
      subnets: [
        {
          type: 'private',
          cidrMask: 24,
        },
      ],
    });
    const prodVpc = new awsx.ec2.Vpc('production-vpc', {
      cidrBlock: this.vpcCidrBlockProd,
      numberOfAvailabilityZones: this.numberOfAvailabilityZones,
      numberOfNatGateways: 1,
      subnets: [
        {
          type: 'private',
          cidrMask: 24,
        },
      ],
    });
    const mgmtVpc = new awsx.ec2.Vpc('management-vpc', {
      cidrBlock: this.vpcCidrBlockMgmt,
      numberOfAvailabilityZones: this.numberOfAvailabilityZones,
      numberOfNatGateways: 1,
      subnets: [
        {
          type: 'private',
          cidrMask: 24,
        },
        {
          type: 'public',
          cidrMask: 24,
        },
      ],
    });
    const mgmtVpcInternetGateway = new aws.ec2.InternetGateway(
      'mgmt-vpc-internet-gateway',
      {vpcId: mgmtVpc.id}
    );

    // Allocate a transit gateway and attach VPCs.
    /* const transitGateway = new aws.ec2transitgateway.TransitGateway('example', {
      description: 'example',
      transitGatewayCidrBlocks: [],
    });
    const transitGatewayAttachmentDev = new aws.ec2transitgateway.VpcAttachment(
      'transit-gateway-attachment-dev',
      {
        subnetIds: devVpc.privateSubnetIds,
        transitGatewayId: transitGateway.id,
        vpcId: devVpc.id,
      }
    );
    const transitGatewayAttachmentProd =
      new aws.ec2transitgateway.VpcAttachment(
        'transit-gateway-attachment-prod',
        {
          subnetIds: prodVpc.privateSubnetIds,
          transitGatewayId: transitGateway.id,
          vpcId: prodVpc.id,
        }
      );
    const transitGatewayAttachmentMgmt =
      new aws.ec2transitgateway.VpcAttachment(
        'transit-gateway-attachment-mgmt',
        {
          subnetIds: mgmtVpc.privateSubnetIds,
          transitGatewayId: transitGateway.id,
          vpcId: mgmtVpc.id,
        }
      ); */

    // Allocate EC2 security group.
    const ec2SecurityGroupDev = Util.generateSecurityGroupForEC2(
      'ec2-security-group-dev',
      devVpc.id
    );
    const ec2SecurityGroupProd = Util.generateSecurityGroupForEC2(
      'ec2-security-group-prod',
      prodVpc.id
    );

    // Allocate RDS security group.
    const rdsSecurityGroupDev = Util.generateSecurityGroupForRDS(
      'rds-security-group-dev',
      devVpc.id,
      [ec2SecurityGroupDev.id]
    );
    const rdsSecurityGroupProd = Util.generateSecurityGroupForRDS(
      'rds-security-group-prod',
      prodVpc.id,
      [ec2SecurityGroupProd.id]
    );

    return {
      //websiteUrl: siteBucket.websiteEndpoint,
    };
  };

  /* End */
}
