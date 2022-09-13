import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
} from '@pulumi/pulumi/automation';
import {InfrastructureStackType} from '@prisma/client';
import {AwsCloudfront_Stack} from './stack/aws-cloudfront.stack';
import {AwsCodecommit_Stack} from './stack/aws-codecommit.stack';
import {AwsEcr_Stack} from './stack/aws-ecr.stack';
import {AwsEcs_Stack} from './stack/aws-ecs.stack';
import {AwsIamUser_Stack} from './stack/aws-iam-user.stack';
import {AwsRds_Stack} from './stack/aws-rds.stack';
import {AwsS3_Stack} from './stack/aws-s3.stack';
import {AwsSqs_Stack} from './stack/aws-sqs.stack';
import {AwsVpc_Stack} from './stack/aws-vpc.stack';
import {AwsWaf_Stack} from './stack/aws-waf.stack';
import {ComputingFargate_Stack} from './stack/computing-fargate.stack';
import {NetworkHipaa_Stack} from './stack/network-hipaa.stack';
import {Null_Stack} from './stack/null.stack';
import {getAwsConfig} from '../../../../_config/_aws.config';
import {getPulumiConfig} from '../../../../_config/_pulumi.config';

@Injectable()
export class PulumiService {
  private pulumiConfig = getPulumiConfig();

  /**
   * Start a stack.
   *
   * The return structure of stack.up() is like below:
      {
        "stdout": "Updating (development)\n\nView Live: https://app.pulumi.com/worldzhy/PINPOINT_HEALTH.FileManager/development/updates/1\n\n\n +  pulumi:pulumi:Stack PINPOINT_HEALTH.FileManager-development creating \n +  aws:s3:Bucket file-manager-bucket creating \n +  aws:s3:Bucket file-manager-bucket created \n +  aws:s3:BucketPolicy bucketPolicy creating \n +  aws:s3:BucketPolicy bucketPolicy created \n +  pulumi:pulumi:Stack PINPOINT_HEALTH.FileManager-development created \n \nResources:\n    + 3 created\n\nDuration: 6s\n\n",
        "stderr": "",
        "summary": {
          "version": 1,
          "kind": "update",
          "startTime": "2022-05-19T06:23:58.000Z",
          "message": "",
          "environment": {
            "exec.kind": "auto.inline"
          },
          "config": {
            "aws:region": {
              "value": "cn-northwest-1",
              "secret": false
            }
          },
          "result": "succeeded",
          "endTime": "2022-05-19T06:24:04.000Z",
          "resourceChanges": {
            "create": 3
          }
        },
        "outputs": {}
      }
   *
   * @returns
   * @memberof PulumiService
   */
  async build(
    stackProjectName: string,
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ): Promise<any> {
    // [step 1] Get Pulumi stack program.
    const program: PulumiFn = this.getStackProgramByType(
      stackType,
      stackParams
    );

    // [step 2] Create the stack.
    const args: InlineProgramArgs = {
      projectName: stackProjectName,
      stackName,
      program,
    };
    const stack = await LocalWorkspace.createOrSelectStack(args);
    await stack.workspace.installPlugin('aws', this.pulumiConfig.awsVersion!);
    if (getAwsConfig().profile) {
      await stack.setAllConfig({
        'aws:profile': {value: getAwsConfig().profile!},
        'aws:region': {value: getAwsConfig().region!},
      });
    } else {
      await stack.setAllConfig({
        'aws:accessKey': {value: getAwsConfig().accessKeyId!},
        'aws:secretKey': {value: getAwsConfig().secretAccessKey!},
        'aws:region': {value: getAwsConfig().region!},
      });
    }

    try {
      return await stack.up({onOutput: console.log}); // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
    } catch (error) {
      return error;
    }
  }

  /**
   * Destroy a stack.
   *
   * @param {string} stackProjectName
   * @param {string} stackName
   * @returns {Promise<DestroyResult>}
   * @memberof PulumiService
   */
  async destroy(
    stackProjectName: string,
    stackName: string
  ): Promise<DestroyResult> {
    const args: InlineProgramArgs = {
      projectName: stackProjectName,
      stackName,
      program: async () => {},
    };

    const stack = await LocalWorkspace.selectStack(args);
    return await stack.destroy({onOutput: console.log});
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#delete-stack
   *
   * @param {string} stackProjectName
   * @param {string} stackName
   * @memberof PulumiService
   */
  async delete(stackProjectName: string, stackName: string) {
    const args: InlineProgramArgs = {
      projectName: stackProjectName,
      stackName,
      program: async () => {},
    };

    const stack = await LocalWorkspace.selectStack(args);
    await stack.workspace.removeStack(stack.name);
  }

  async deleteByForce(stackProjectName: string, stackName: string) {
    const url = `https://api.pulumi.com/api/stacks/worldzhy/${stackProjectName}/${stackName}`;
    console.log(url);
    return await axios.delete(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + this.pulumiConfig.accessToken,
      },
      params: {
        force: true,
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#list-stacks
   *
   * @returns
   * @memberof PulumiService
   */
  async getStacks(stackProjectName: string) {
    const url = `https://api.pulumi.com/api/user/stacks?project=${stackProjectName}`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + this.pulumiConfig.accessToken,
      },
    });
  }

  /**
   * Get stack outputs.
   *
   * @param {string} stackProjectName
   * @param {string} stackName
   * @param {InfrastructureStackType} stackType
   * @memberof PulumiService
   */
  async getStackOutputs(
    stackProjectName: string,
    stackName: string,
    stackType: InfrastructureStackType
  ) {
    // [step 1] Create stack args.
    const args: InlineProgramArgs = {
      projectName: stackProjectName,
      stackName,
      program: async () => {},
    };

    // [step 2] Get stack.
    const stack = await LocalWorkspace.selectStack(args);
    await stack.workspace.installPlugin('aws', this.pulumiConfig.awsVersion!);
    await stack.setAllConfig({
      'aws:region': {value: getAwsConfig().region!},
      'aws:profile': {value: stackProjectName},
    });

    // [step 3] Get stack outputs.
    const outputs = await stack.outputs();
    const outputKeys =
      this.getStackServiceByType(stackType)?.getStackOutputKeys();
    return outputKeys?.map(key => {
      if (outputs[key].secret) {
        return {[key]: outputs[key].value};
      } else {
        return {[key]: outputs[key].value};
      }
    });
  }

  /**
   * Get example parameters of stack.
   *
   * @param {InfrastructureStackType} stackType
   * @returns
   * @memberof PulumiService
   */
  getStackParams(stackType: InfrastructureStackType) {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }

  /**
   * Check parameters before building stack.
   *
   * @param {InfrastructureStackType} stackType
   * @param {object} params
   * @returns
   * @memberof PulumiService
   */
  checkStackParams(stackType: InfrastructureStackType, params: object) {
    return this.getStackServiceByType(stackType)?.checkStackParams(params);
  }

  /**
   * Get Pulumi program for stack-up.
   *
   * @private
   * @param {InfrastructureStackType} stackType
   * @param {*} stackParams
   * @returns
   * @memberof PulumiService
   */
  private getStackProgramByType(
    stackType: InfrastructureStackType,
    stackParams: any
  ) {
    return this.getStackServiceByType(stackType).getStackProgram(stackParams);
  }

  /**
   * Get stack class
   *
   * @param {InfrastructureStackType} type
   * @returns
   * @memberof InfrastructureStackService
   */
  private getStackServiceByType(type: InfrastructureStackType) {
    switch (type) {
      case InfrastructureStackType.P_AWS_CLOUDFRONT:
        return AwsCloudfront_Stack;
      case InfrastructureStackType.P_AWS_CODE_COMMIT:
        return AwsCodecommit_Stack;
      case InfrastructureStackType.P_AWS_ECR:
        return AwsEcr_Stack;
      case InfrastructureStackType.P_AWS_ECS:
        return AwsEcs_Stack;
      case InfrastructureStackType.P_AWS_EKS:
        return AwsEcs_Stack;
      case InfrastructureStackType.P_AWS_IAM_USER:
        return AwsIamUser_Stack;
      case InfrastructureStackType.P_AWS_RDS:
        return AwsRds_Stack;
      case InfrastructureStackType.P_AWS_S3:
        return AwsS3_Stack;
      case InfrastructureStackType.P_AWS_SQS:
        return AwsSqs_Stack;
      case InfrastructureStackType.P_AWS_VPC:
        return AwsVpc_Stack;
      case InfrastructureStackType.P_AWS_WAF:
        return AwsWaf_Stack;
      case InfrastructureStackType.P_COMPUTING_FARGATE:
        return ComputingFargate_Stack;
      case InfrastructureStackType.P_NETWORK_HIPAA:
        return NetworkHipaa_Stack;
      default:
        return Null_Stack;
    }
  }

  /* End */
}
