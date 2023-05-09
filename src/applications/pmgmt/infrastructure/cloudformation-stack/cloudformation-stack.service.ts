import {Injectable} from '@nestjs/common';
import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {fromIni} from '@aws-sdk/credential-providers';
import {
  CloudFormationStack,
  CloudFormationStackState,
  CloudFormationStackType,
  Prisma,
} from '@prisma/client';
import {CicdBuild_Stack} from './stack/cicd-build.stack';
import {CicdPipeline_Stack} from './stack/cicd-pipeline.stack';
import {CicdRepository_Stack} from './stack/cicd-repository.stack';
import {ComputingFargate_Stack} from './stack/computing-fargate.stack';
import {NetworkHipaa_Stack} from './stack/network-hipaa.stack';
import {ProductMessageTracker_Stack} from './stack/product-message-tracker.stack';
import {Null_Stack} from './stack/null.stack';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';
import {generateRandomNumbers} from '../../../../toolkits/utilities/common.util';
import {getAwsConfig} from '../../../../toolkits/aws/aws.config';

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
              generateRandomNumbers(8)
            ).replace(/_/g, '-');
          }
        }
      }
      return next(params);
    });

    return await this.prisma.cloudFormationStack.create(params);
  }

  async update(
    params: Prisma.CloudFormationStackUpdateArgs
  ): Promise<CloudFormationStack> {
    return await this.prisma.cloudFormationStack.update(params);
  }

  async delete(
    params: Prisma.CloudFormationStackDeleteArgs
  ): Promise<CloudFormationStack> {
    return await this.prisma.cloudFormationStack.delete(params);
  }

  //* Create resources
  async createResources(
    stack: CloudFormationStack
  ): Promise<CloudFormationStack> {
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

    const output = await client.send(command);
    return await this.prisma.cloudFormationStack.update({
      where: {id: stack.id},
      data: {
        state: CloudFormationStackState.BUILD,
        createStackOutput: output as object,
      },
    });
  }

  //* Describe resources
  async describeResources(
    stack: CloudFormationStack
  ): Promise<CloudFormationStack> {
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
    const command = new DescribeStacksCommand({StackName: stack.name!});

    // [step 3] Send command.

    const output = await client.send(command);
    return await this.prisma.cloudFormationStack.update({
      where: {id: stack.id},
      data: {
        describeStackOutput: output as object,
      },
    });
  }

  //* Destroy resources.
  async destroyResources(
    stack: CloudFormationStack
  ): Promise<CloudFormationStack> {
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

    const output = await client.send(command);
    return await this.prisma.cloudFormationStack.update({
      where: {id: stack.id},
      data: {
        state: CloudFormationStackState.DESTROYED,
        deleteStackOutput: output as object,
      },
    });
  }

  //* Get example parameters of stack.
  getStackParams(stackType: CloudFormationStackType): {} {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }

  //* Check parameters before building stack.
  checkStackParams(
    stackType: CloudFormationStackType,
    params: object
  ): boolean {
    return this.getStackServiceByType(stackType)?.checkStackParams(params);
  }

  //* Get CloudFormation template URL.
  private getStackTemplateByType(stackType: CloudFormationStackType): string {
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

  //* Get stack class
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
