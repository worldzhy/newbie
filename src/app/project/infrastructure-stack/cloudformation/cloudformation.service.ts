import {Injectable} from '@nestjs/common';
import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
} from '@aws-sdk/client-cloudformation';
import {fromIni} from '@aws-sdk/credential-providers';
import {InfrastructureStackType} from '@prisma/client';
import {S3_Stack} from './stack/s3.stack';
import {Hipaa_Stack} from './stack/hipaa.stack';
import {MessageTracker_Stack} from './stack/message-tracker.stack';

@Injectable()
export class CloudFormationService {
  private awsProfile: string;
  private awsAccessKey: string;
  private awsSecretKey: string;
  private awsRegion: string;

  /**
   * Attention:
   * These 4 functions must be called before 'PulumiService.build()'.
   *
   * @param {string} awsProfile
   * @returns
   * @memberof PulumiService
   */
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

  async build(
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ) {
    const client = new CloudFormationClient({
      credentials: fromIni({profile: this.awsProfile}),
      region: this.awsRegion,
    });

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
    return this.getStackServiceByType(stackType).getStackTemplate();
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
      case InfrastructureStackType.AWS_CLOUDFRONT:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_CODE_COMMIT:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_ECR:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_ECS:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_EKS:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_IAM_USER:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_RDS:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_S3:
        return S3_Stack;
      case InfrastructureStackType.AWS_SQS:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_VPC:
        return Hipaa_Stack;
      case InfrastructureStackType.AWS_WAF:
        return Hipaa_Stack;
      case InfrastructureStackType.HIPAA:
        return Hipaa_Stack;
      case InfrastructureStackType.MESSAGE_TRACKER:
        return MessageTracker_Stack;
    }
  }
}
