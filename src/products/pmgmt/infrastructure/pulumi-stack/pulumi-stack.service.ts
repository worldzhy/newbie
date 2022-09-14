import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
} from '@pulumi/pulumi/automation';
import {
  Prisma,
  PulumiStack,
  PulumiStackState,
  PulumiStackType,
} from '@prisma/client';
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
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class PulumiStackService {
  private pulumiConfig = getPulumiConfig();
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.PulumiStackFindUniqueArgs
  ): Promise<PulumiStack | null> {
    return await this.prisma.pulumiStack.findUnique(params);
  }

  async findMany(
    params: Prisma.PulumiStackFindManyArgs
  ): Promise<PulumiStack[]> {
    return await this.prisma.pulumiStack.findMany(params);
  }

  async create(data: Prisma.PulumiStackCreateInput): Promise<PulumiStack> {
    try {
      return await this.prisma.pulumiStack.create({
        data,
      });
    } catch (error) {
      return error;
    }
  }

  async update(params: Prisma.PulumiStackUpdateArgs): Promise<PulumiStack> {
    try {
      return await this.prisma.pulumiStack.update(params);
    } catch (error) {
      return error;
    }
  }

  async delete(params: Prisma.PulumiStackDeleteArgs): Promise<PulumiStack> {
    return await this.prisma.pulumiStack.delete(params);
  }

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
    stackType: PulumiStackType,
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
   * @param {PulumiStack} stack
   * @memberof PulumiService
   */
  async deleteOnPulumi(stack: PulumiStack) {
    const args: InlineProgramArgs = {
      projectName: stack.pulumiProject,
      stackName: stack.name,
      program: async () => {},
    };

    // [step 1] Remove stack on Pulumi.
    const pulumiStack = await LocalWorkspace.selectStack(args);
    await pulumiStack.workspace.removeStack(stack.name);

    // [step 2] Update database record of infrastructureStack.
    return await this.prisma.pulumiStack.update({
      where: {id: stack.id},
      data: {state: PulumiStackState.DELETED},
    });
  }

  async forceDeleteOnPulumi(stack: PulumiStack) {
    const url = `https://api.pulumi.com/api/stacks/worldzhy/${stack.pulumiProject}/${stack.name}`;

    // [step 1] Force delete stack on Pulumi.
    const response = await axios.delete(url, {
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

    // [step 2] Update database record of infrastructureStack.
    return await this.prisma.pulumiStack.update({
      where: {id: stack.id},
      data: {state: PulumiStackState.DELETED},
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
   * @param {PulumiStackType} stackType
   * @memberof PulumiService
   */
  async getStackOutputs(
    stackProjectName: string,
    stackName: string,
    stackType: PulumiStackType
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
   * @param {PulumiStackType} stackType
   * @returns
   * @memberof PulumiService
   */
  getStackParams(stackType: PulumiStackType) {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }

  /**
   * Check parameters before building stack.
   *
   * @param {PulumiStackType} stackType
   * @param {object} params
   * @returns
   * @memberof PulumiService
   */
  checkStackParams(stackType: PulumiStackType, params: object) {
    return this.getStackServiceByType(stackType)?.checkStackParams(params);
  }

  /**
   * Get Pulumi program for stack-up.
   *
   * @private
   * @param {PulumiStackType} stackType
   * @param {*} stackParams
   * @returns
   * @memberof PulumiService
   */
  private getStackProgramByType(stackType: PulumiStackType, stackParams: any) {
    return this.getStackServiceByType(stackType).getStackProgram(stackParams);
  }

  /**
   * Get stack class
   *
   * @param {PulumiStackType} type
   * @returns
   * @memberof PulumiStackService
   */
  private getStackServiceByType(type: PulumiStackType) {
    switch (type) {
      case PulumiStackType.AWS_CLOUDFRONT:
        return AwsCloudfront_Stack;
      case PulumiStackType.AWS_CODE_COMMIT:
        return AwsCodecommit_Stack;
      case PulumiStackType.AWS_ECR:
        return AwsEcr_Stack;
      case PulumiStackType.AWS_ECS:
        return AwsEcs_Stack;
      case PulumiStackType.AWS_EKS:
        return AwsEcs_Stack;
      case PulumiStackType.AWS_IAM_USER:
        return AwsIamUser_Stack;
      case PulumiStackType.AWS_RDS:
        return AwsRds_Stack;
      case PulumiStackType.AWS_S3:
        return AwsS3_Stack;
      case PulumiStackType.AWS_SQS:
        return AwsSqs_Stack;
      case PulumiStackType.AWS_VPC:
        return AwsVpc_Stack;
      case PulumiStackType.AWS_WAF:
        return AwsWaf_Stack;
      case PulumiStackType.COMPUTING_FARGATE:
        return ComputingFargate_Stack;
      case PulumiStackType.NETWORK_HIPAA:
        return NetworkHipaa_Stack;
      default:
        return Null_Stack;
    }
  }

  /* End */
}
