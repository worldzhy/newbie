import {Injectable} from '@nestjs/common';
import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {fromIni} from '@aws-sdk/credential-providers';
import {CicdBuild_Stack} from './stack/cicd-build.stack';
import {CicdPipeline_Stack} from './stack/cicd-pipeline.stack';
import {CicdRepository_Stack} from './stack/cicd-repository.stack';
import {ComputingFargate_Stack} from './stack/computing-fargate.stack';
import {NetworkHipaa_Stack} from './stack/network-hipaa.stack';
import {ProductMessageTracker_Stack} from './stack/product-message-tracker.stack';
import {Null_Stack} from './stack/null.stack';
import {getAwsConfig} from '../../../../_config/_aws.config';
import {
  CloudFormationStack,
  CloudFormationStackState,
  CloudFormationStackType,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';
import {randomCode} from '../../../../toolkits/utilities/common.util';

@Injectable()
export class CloudFormationStackService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.CloudFormationStackFindUniqueArgs
  ): Promise<CloudFormationStack | null> {
    return await this.prisma.cloudFormationStack.findUnique(params);
  }

  async findMany(
    params: Prisma.CloudFormationStackFindManyArgs
  ): Promise<CloudFormationStack[]> {
    return await this.prisma.cloudFormationStack.findMany(params);
  }

  async create(
    params: Prisma.CloudFormationStackCreateArgs
  ): Promise<CloudFormationStack> {
    // [middleware] Set the default stack name. AWS CloudFormation stack name must satisfy regular expression pattern: "[a-zA-Z][-a-zA-Z0-9]*".
    this.prisma.$use(async (params, next) => {
      if (params.model === 'CloudFormationStack') {
        if (params.action === 'create') {
          if (!params.args['data']['name']) {
            params.args['data']['name'] = (
              params.args['data']['type'] +
              '-' +
              randomCode(8)
            ).replace(/_/g, '-');
          }
        }
      }
      return next(params);
    });

    try {
      return await this.prisma.cloudFormationStack.create(params);
    } catch (error) {
      return error;
    }
  }

  async update(
    params: Prisma.CloudFormationStackUpdateArgs
  ): Promise<CloudFormationStack> {
    try {
      return await this.prisma.cloudFormationStack.update(params);
    } catch (error) {
      return error;
    }
  }

  async delete(
    params: Prisma.CloudFormationStackDeleteArgs
  ): Promise<CloudFormationStack> {
    return await this.prisma.cloudFormationStack.delete(params);
  }

  /**
   * Build stack
   *
   * @param {CloudFormationStack} stack
   * @returns
   * @memberof CloudFormationStackService
   */
  async createResources(stack: CloudFormationStack) {
    // [step 1] Create a cloudformation client.
    let client: CloudFormationClient;
    if (getAwsConfig().profile) {
      client = new CloudFormationClient({
        // Get credentials from local credentials file "~/.aws/credentials"
        credentials: fromIni({profile: getAwsConfig().profile}),
        region: getAwsConfig().region,
      });
    } else {
      client = new CloudFormationClient({
        credentials: {
          accessKeyId: getAwsConfig().accessKeyId!,
          secretAccessKey: getAwsConfig().secretAccessKey!,
        },
        region: getAwsConfig().region,
      });
    }

    // [step 2] Build parameters for cloudformation command.
    switch (stack.type) {
      case CloudFormationStackType.CICD_BUILD:
        break;
      case CloudFormationStackType.CICD_PIPELINE:
        break;
      case CloudFormationStackType.CICD_REPOSITORY:
        break;
      case CloudFormationStackType.COMPUTING_FARGATE:
        break;
      case CloudFormationStackType.NETWORK_HIPAA:
        stack.params!['AWSConfigARN'] =
          'arn:aws:iam::' +
          getAwsConfig().accountId +
          ':role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig';
        break;
      case CloudFormationStackType.PRODUCT_DATA_ENGINE:
        break;
      case CloudFormationStackType.PRODUCT_MESSAGE_TRACKER:
        break;
      default:
        break;
    }
    const command = new CreateStackCommand({
      Capabilities: [Capability.CAPABILITY_IAM], // Allow cloudformation to create IAM resource.
      StackName: stack.name!,
      TemplateURL: this.getStackTemplateByType(stack.type),
      Parameters: Object.keys(stack.params!).map(key => {
        return {ParameterKey: key, ParameterValue: stack.params![key]};
      }),
    });

    // [step 3] Send command and update state.
    try {
      const output = await client.send(command);
      return await this.prisma.cloudFormationStack.update({
        where: {id: stack.id},
        data: {
          state: CloudFormationStackState.BUILD,
          createStackOutput: output as object,
        },
      });
    } catch (error) {
      // error handling.
      return {
        summary: {result: 'failed'},
        error: error,
      };
    } finally {
      // finally.
    }
  }

  /**
   * Describe stack
   *
   * @param {string} stackName
   * @memberof CloudFormationStackService
   */
  async describe(stackName: string) {
    // [step 1] Create a cloudformation client.
    let client: CloudFormationClient;
    if (getAwsConfig().profile) {
      client = new CloudFormationClient({
        // Get credentials from local credentials file "~/.aws/credentials"
        credentials: fromIni({profile: getAwsConfig().profile}),
        region: getAwsConfig().region,
      });
    } else {
      client = new CloudFormationClient({
        credentials: {
          accessKeyId: getAwsConfig().accessKeyId!,
          secretAccessKey: getAwsConfig().secretAccessKey!,
        },
        region: getAwsConfig().region,
      });
    }

    // [step 2] Build parameters for cloudformation command.
    const command = new DescribeStacksCommand({StackName: stackName});

    // [step 3] Send command.
    try {
      const data = await client.send(command);
      // process data.
      return {
        summary: {result: 'succeeded'},
        data: data,
      };
    } catch (error) {
      // error handling.
      return {
        summary: {result: 'failed'},
        error: error,
      };
    } finally {
      // finally.
    }
  }

  /**
   * Destroy stack resources.
   *
   * @param {CloudFormationStack} stack
   * @returns
   * @memberof CloudFormationStackService
   */
  async destroyResources(stack: CloudFormationStack) {
    // [step 1] Create a cloudformation client.
    let client: CloudFormationClient;
    if (getAwsConfig().profile) {
      client = new CloudFormationClient({
        // Get credentials from local credentials file "~/.aws/credentials"
        credentials: fromIni({profile: getAwsConfig().profile}),
        region: getAwsConfig().region,
      });
    } else {
      client = new CloudFormationClient({
        credentials: {
          accessKeyId: getAwsConfig().accessKeyId!,
          secretAccessKey: getAwsConfig().secretAccessKey!,
        },
        region: getAwsConfig().region,
      });
    }

    // [step 2] Build parameters for cloudformation command.
    const command = new DeleteStackCommand({StackName: stack.name!});

    // [step 3] Send command and update state.
    try {
      const output = await client.send(command);
      return await this.prisma.cloudFormationStack.update({
        where: {id: stack.id},
        data: {
          state: CloudFormationStackState.DESTROYED,
          deleteStackOutput: output as object,
        },
      });
    } catch (error) {
      // error handling.
      return {
        summary: {result: 'failed'},
        error: error,
      };
    }
  }

  /**
   * Get example parameters of stack.
   *
   * @param {CloudFormationStackType} stackType
   * @returns
   * @memberof PulumiService
   */
  getStackParams(stackType: CloudFormationStackType) {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }

  /**
   * Check parameters before building stack.
   *
   * @param {CloudFormationStackType} stackType
   * @param {object} params
   * @returns
   * @memberof PulumiService
   */
  checkStackParams(stackType: CloudFormationStackType, params: object) {
    return this.getStackServiceByType(stackType)?.checkStackParams(params);
  }

  /**
   * Get CloudFormation template URL.
   *
   * @private
   * @param {CloudFormationStackType} stackType
   * @returns
   * @memberof CloudFormationStackService
   */
  private getStackTemplateByType(stackType: CloudFormationStackType) {
    const templatePath =
      this.getStackServiceByType(stackType).getStackTemplate();
    if (getAwsConfig().region!.startsWith('cn')) {
      return (
        'https://' +
        getAwsConfig().s3ForCloudformation +
        '.s3.' +
        getAwsConfig().region +
        '.amazonaws.com.cn/' +
        templatePath
      );
    } else {
      return (
        'https://' +
        getAwsConfig().s3ForCloudformation +
        '.s3.amazonaws.com/' +
        templatePath
      );
    }
  }

  /**
   * Get stack class
   *
   * @param {CloudFormationStackType} type
   * @returns
   * @memberof CloudFormationStackService
   */
  private getStackServiceByType(type: CloudFormationStackType) {
    switch (type) {
      case CloudFormationStackType.CICD_BUILD:
        return CicdBuild_Stack;
      case CloudFormationStackType.CICD_PIPELINE:
        return CicdPipeline_Stack;
      case CloudFormationStackType.CICD_REPOSITORY:
        return CicdRepository_Stack;
      case CloudFormationStackType.COMPUTING_FARGATE:
        return ComputingFargate_Stack;
      case CloudFormationStackType.NETWORK_HIPAA:
        return NetworkHipaa_Stack;
      case CloudFormationStackType.PRODUCT_DATA_ENGINE:
        return Null_Stack;
      case CloudFormationStackType.PRODUCT_MESSAGE_TRACKER:
        return ProductMessageTracker_Stack;
      default:
        return Null_Stack;
    }
  }
}
