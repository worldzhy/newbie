import {Injectable} from '@nestjs/common';
import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
} from '@aws-sdk/client-cloudformation';
import {fromIni} from '@aws-sdk/credential-providers';
import {InfrastructureStackType} from '@prisma/client';
import {AppMessageTracker_Stack} from './stack/app-message-tracker.stack';
import {AwsS3_Stack} from './stack/aws-s3.stack';
import {CicdBuild_Stack} from './stack/cicd-build.stack';
import {CicdPipeline_Stack} from './stack/cicd-pipeline.stack';
import {CicdRepository_Stack} from './stack/cicd-repository.stack';
import {ComputingFargate_Stack} from './stack/computing-fargate.stack';
import {NetworkHipaa_Stack} from './stack/network-hipaa.stack';
import {Null_Stack} from './stack/null.stack';

@Injectable()
export class CloudFormationService {
  private awsAccountId: string;
  private awsProfile: string;
  private awsAccessKey: string;
  private awsSecretKey: string;
  private awsRegion: string;
  private cfTemplateS3: string;

  /**
   * Attention:
   * These 6 functions must be called before 'PulumiService.build()'.
   *
   * @param {string} awsAccountId
   * @returns
   * @memberof CloudFormationService
   */
  setAwsAccountId(awsAccountId: string) {
    this.awsAccountId = awsAccountId;
    return this;
  }
  setAwsProfile(awsProfile: string) {
    this.awsProfile = awsProfile;
    return this;
  }
  setAwsAccessKey(awsAccessKey: string) {
    this.awsAccessKey = awsAccessKey;
    return this;
  }
  setAwsSecretKey(awsSecretKey: string) {
    this.awsSecretKey = awsSecretKey;
    return this;
  }
  setAwsRegion(awsRegion: string) {
    this.awsRegion = awsRegion;
    return this;
  }
  setCfTemplateS3(cfTemplateS3: string) {
    this.cfTemplateS3 = cfTemplateS3;
    return this;
  }

  async build(
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ) {
    // Create a cloudformation client.
    const client = new CloudFormationClient({
      credentials: fromIni({profile: this.awsProfile}),
      region: this.awsRegion,
    });

    // Build parameters for cloudformation command.
    switch (stackType) {
      case InfrastructureStackType.C_APP_MESSAGE_TRACKER:
        break;
      case InfrastructureStackType.C_AWS_S3:
        break;
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
          this.awsAccountId +
          ':role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig';
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

  async destroy(stackName: string) {
    const client = new CloudFormationClient({
      credentials: fromIni({profile: this.awsProfile}),
      region: this.awsRegion,
    });

    const params = {
      /** input parameters */
      StackName: stackName,
    };

    const command = new DeleteStackCommand(params);

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
    if (this.awsRegion.startsWith('cn')) {
      return (
        'https://' +
        this.cfTemplateS3 +
        '.s3.' +
        this.awsRegion +
        '.amazonaws.com.cn/' +
        templatePath
      );
    } else {
      return (
        'https://' + this.cfTemplateS3 + '.s3.amazonaws.com/' + templatePath
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
      case InfrastructureStackType.C_APP_MESSAGE_TRACKER:
        return AppMessageTracker_Stack;
      case InfrastructureStackType.C_AWS_S3:
        return AwsS3_Stack;
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
      default:
        return Null_Stack;
    }
  }
}
