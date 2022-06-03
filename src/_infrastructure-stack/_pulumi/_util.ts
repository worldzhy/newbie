import * as aws from '@pulumi/aws';
import {Input} from '@pulumi/pulumi';
import {Config} from '../../_config/_common.config';

export class PulumiUtil {
  static resourceOptions = {
    transformations: [
      // Update all RolePolicyAttachment resources to use aws-cn ARNs.
      args => {
        if (
          args.type === 'aws:iam/rolePolicyAttachment:RolePolicyAttachment' &&
          Config.getRegion().startsWith('cn')
        ) {
          const arn: string | undefined = args.props['policyArn'];
          if (arn && arn.startsWith('arn:aws:iam')) {
            args.props['policyArn'] = arn.replace(
              'arn:aws:iam',
              'arn:aws-cn:iam'
            );
          }
          return {
            props: args.props,
            opts: args.opts,
          };
        }
        return undefined;
      },
    ],
  };

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
