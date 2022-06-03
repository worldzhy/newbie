import * as aws from '@pulumi/aws';

export const createAwsVpcStack =
  (params: {vpcName?: string; vpcCidrBlock?: string}) => async () => {
    let vpcName = params.vpcName;
    let vpcCidrBlock = params.vpcCidrBlock;

    // [step 1] Guard statement.
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

    // Allocate development, production and management VPCs.
    const vpc = new aws.ec2.Vpc(vpcName, {
      cidrBlock: vpcCidrBlock,
    });

    return {
      vpcId: vpc.id,
      defaultSecurityGroup: vpc.defaultSecurityGroupId,
    };
  };
