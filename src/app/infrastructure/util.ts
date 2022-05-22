import * as aws from '@pulumi/aws';
import {Input} from '@pulumi/pulumi';

export class Util {
  static generateSecurityGroupForEC2 = (name: string, vpcId: Input<string>) => {
    return new aws.ec2.SecurityGroup(name, {
      vpcId: vpcId,
      ingress: [
        {
          description: 'allow SSH access from',
          fromPort: 22,
          toPort: 22,
          protocol: 'tcp',
          securityGroups: [],
        },
        {
          description: 'allow access from EC2 security group',
          fromPort: 80,
          toPort: 80,
          protocol: 'tcp',
          securityGroups: [],
        },
        {
          description: 'allow HTTPS access from anywhere',
          fromPort: 443,
          toPort: 443,
          protocol: 'tcp',
          securityGroups: [],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    });
  };

  static generateSecurityGroupForRDS = (
    name: string,
    vpcId: Input<string>,
    allowedSecurityGroups: Input<string>[]
  ) => {
    return new aws.ec2.SecurityGroup(name, {
      vpcId: vpcId,
      ingress: [
        {
          description: 'allow access from EC2 security group',
          fromPort: 5432,
          toPort: 5432,
          protocol: 'tcp',
          securityGroups: allowedSecurityGroups,
        },
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          self: true,
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    });
  };
}
