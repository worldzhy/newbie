import {Injectable} from '@nestjs/common';
import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {fromIni} from '@aws-sdk/credential-providers';
import {InfrastructureStackType} from '@prisma/client';
import {CicdBuild_Stack} from './stack/cicd-build.stack';
import {CicdPipeline_Stack} from './stack/cicd-pipeline.stack';
import {CicdRepository_Stack} from './stack/cicd-repository.stack';
import {ComputingFargate_Stack} from './stack/computing-fargate.stack';
import {NetworkHipaa_Stack} from './stack/network-hipaa.stack';
import {ProductMessageTracker_Stack} from './stack/product-message-tracker.stack';
import {Null_Stack} from './stack/null.stack';
import {getAwsConfig} from '../../../../_config/_aws.config';

@Injectable()
export class CloudFormationService {
  /**
   * Build stack
   *
   * @param {string} stackName
   * @param {InfrastructureStackType} stackType
   * @param {*} stackParams
   * @returns
   * @memberof CloudFormationService
   */
  async build(
    stackName: string,
    stackType: InfrastructureStackType,
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
      case InfrastructureStackType.C_CICD_BUILD:
        break;
      case InfrastructureStackType.C_CICD_PIPELINE:
        break;
      case InfrastructureStackType.C_CICD_REPOSITORY:
        break;
      case InfrastructureStackType.C_COMPUTING_FARGATE:
        break;
      case InfrastructureStackType.C_NETWORK_HIPAA:
        stackParams['AWSConfigARN'] =
          'arn:aws:iam::' +
          getAwsConfig().accountId +
          ':role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig';
        break;
      case InfrastructureStackType.C_PRODUCT_IDE:
        break;
      case InfrastructureStackType.C_PRODUCT_MESSAGE_TRACKER:
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
   * @memberof CloudFormationService
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
   * @memberof CloudFormationService
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

  async delete() {
    // Do nothing because destroying is enough for CloudFormation stack.
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
   * Get CloudFormation template URL.
   *
   * @private
   * @param {InfrastructureStackType} stackType
   * @returns
   * @memberof CloudFormationService
   */
  private getStackTemplateByType(stackType: InfrastructureStackType) {
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
   * @param {InfrastructureStackType} type
   * @returns
   * @memberof InfrastructureStackService
   */
  private getStackServiceByType(type: InfrastructureStackType) {
    switch (type) {
      case InfrastructureStackType.C_CICD_BUILD:
        return CicdBuild_Stack;
      case InfrastructureStackType.C_CICD_PIPELINE:
        return CicdPipeline_Stack;
      case InfrastructureStackType.C_CICD_REPOSITORY:
        return CicdRepository_Stack;
      case InfrastructureStackType.C_COMPUTING_FARGATE:
        return ComputingFargate_Stack;
      case InfrastructureStackType.C_NETWORK_HIPAA:
        return NetworkHipaa_Stack;
      case InfrastructureStackType.C_PRODUCT_IDE:
        return Null_Stack;
      case InfrastructureStackType.C_PRODUCT_MESSAGE_TRACKER:
        return ProductMessageTracker_Stack;
      default:
        return Null_Stack;
    }
  }
}
