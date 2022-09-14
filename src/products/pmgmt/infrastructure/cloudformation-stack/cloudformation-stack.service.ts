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
  CloudFormationStackType,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

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
    data: Prisma.CloudFormationStackCreateInput
  ): Promise<CloudFormationStack> {
    try {
      return await this.prisma.cloudFormationStack.create({
        data,
      });
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
   * @param {string} stackName
   * @param {CloudFormationStackType} stackType
   * @param {*} stackParams
   * @returns
   * @memberof CloudFormationStackService
   */
  async build(
    stackName: string,
    stackType: CloudFormationStackType,
    stackParams: any
  ) {
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
    switch (stackType) {
      case CloudFormationStackType.CICD_BUILD:
        break;
      case CloudFormationStackType.CICD_PIPELINE:
        break;
      case CloudFormationStackType.CICD_REPOSITORY:
        break;
      case CloudFormationStackType.COMPUTING_FARGATE:
        break;
      case CloudFormationStackType.NETWORK_HIPAA:
        stackParams['AWSConfigARN'] =
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
    const params = {
      Capabilities: [Capability.CAPABILITY_IAM], // Allow cloudformation to create IAM resource.
      StackName: stackName,
      TemplateURL: this.getStackTemplateByType(stackType),
      Parameters: Object.keys(stackParams).map(key => {
        return {ParameterKey: key, ParameterValue: stackParams[key]};
      }),
    };
    const command = new CreateStackCommand(params);

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
    const params = {
      /** input parameters */
      StackName: stackName,
    };
    const command = new DescribeStacksCommand(params);

    // [step 3] Send command
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
   * Destroy stack
   *
   * @param {string} stackName
   * @returns
   * @memberof CloudFormationStackService
   */
  async destroy(stackName: string) {
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
    const params = {
      /** input parameters */
      StackName: stackName,
    };
    const command = new DeleteStackCommand(params);

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
