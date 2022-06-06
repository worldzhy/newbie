import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {CommonUtil} from '../../../../_util/_common.util';
import {PulumiUtil} from '../pulumi.util';

@Injectable()
export class AwsVpc_StackService {
  static getStackParams() {
    return {
      vpcName: 'pulumi-test-vpc',
      vpcCidrBlock: '10.21.0.0/16',
    };
  }

  static getStackProgram =
    (params: {vpcName?: string; vpcCidrBlock?: string}, awsRegion: string) =>
    async () => {
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
      const uniqueResourceName = 'vpc-' + CommonUtil.randomCode(4);
      const vpc = new aws.ec2.Vpc(
        uniqueResourceName,
        {
          cidrBlock: vpcCidrBlock,
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        vpcId: vpc.id,
        defaultSecurityGroup: vpc.defaultSecurityGroupId,
      };
    };
}
