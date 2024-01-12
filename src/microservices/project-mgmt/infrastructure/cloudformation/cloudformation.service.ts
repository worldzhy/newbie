import {BadRequestException, Injectable} from '@nestjs/common';
import {
  Capability,
  CloudFormationClient,
  CreateStackCommand,
  CreateStackCommandOutput,
  DeleteStackCommand,
  DeleteStackCommandOutput,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {fromIni} from '@aws-sdk/credential-providers';
import {InfrastructureStack, ProjectEnvironment} from '@prisma/client';
import {CicdBuild_Stack} from './stack/cicd-build.stack';
import {CicdPipeline_Stack} from './stack/cicd-pipeline.stack';
import {CicdRepository_Stack} from './stack/cicd-repository.stack';
import {ComputingFargate_Stack} from './stack/computing-fargate.stack';
import {NetworkHipaa_Stack} from './stack/network-hipaa.stack';
import {ProductMessageTracker_Stack} from './stack/product-message-tracker.stack';
import {Null_Stack} from './stack/null.stack';

export const CloudFormationStackType = {
  CICD_BUILD: 'CICD_BUILD',
  CICD_PIPELINE: 'CICD_PIPELINE',
  CICD_REPOSITORY: 'CICD_REPOSITORY',
  FARGATE: 'FARGATE',
  HIPAA_NETWORK: 'HIPAA_NETWORK',
  MESSAGE_TRACKER: 'MESSAGE_TRACKER',
};

@Injectable()
export class CloudFormationStackService {
  //* Create resources
  async createResources(
    stack: InfrastructureStack
  ): Promise<CreateStackCommandOutput> {
    // [step 1] Create a cloudformation client.
    const environment = stack['environment'] as ProjectEnvironment;
    const client = this.getCloudFormationClient(environment);

    // [step 2] Build parameters for cloudformation command.
    switch (stack.type) {
      case CloudFormationStackType.CICD_BUILD:
        break;
      case CloudFormationStackType.CICD_PIPELINE:
        break;
      case CloudFormationStackType.CICD_REPOSITORY:
        break;
      case CloudFormationStackType.FARGATE:
        break;
      case CloudFormationStackType.HIPAA_NETWORK:
        stack.params!['AWSConfigARN'] =
          'arn:aws:iam::' +
          environment.awsAccountId +
          ':role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig';
        break;
      case CloudFormationStackType.MESSAGE_TRACKER:
        stack.params!['LambdaCodeS3BucketName'] = 'aws-quickstart-077767357755';
        stack.params!['PinpointEventProcessorLambdaCodeArchiveName'] = '';
        stack.params!['AlarmLambdaCodeArchiveName'] = '';
        stack.params!['MessageShooterLambdaCodeArchiveName'] = '';
        break;
      default:
        break;
    }
    const command = new CreateStackCommand({
      Capabilities: [Capability.CAPABILITY_IAM], // Allow cloudformation to create IAM resource.
      StackName: stack.name!,
      TemplateURL: this.getStackTemplate(stack),
      Parameters: Object.keys(stack.params!).map(key => {
        return {ParameterKey: key, ParameterValue: stack.params![key]};
      }),
    });

    // [step 3] Send command and update state.
    return await client.send(command);
  }

  //* Describe resources
  async describeResources(stack: InfrastructureStack) {
    // [step 1] Create a cloudformation client.
    const environment = stack['environment'] as ProjectEnvironment;
    const client = this.getCloudFormationClient(environment);

    // [step 2] Build parameters for cloudformation command.
    const command = new DescribeStacksCommand({StackName: stack.name!});

    // [step 3] Send command.

    return await client.send(command);
  }

  //* Destroy resources.
  async destroyResources(
    stack: InfrastructureStack
  ): Promise<DeleteStackCommandOutput> {
    // [step 1] Create a cloudformation client.
    const environment = stack['environment'] as ProjectEnvironment;
    const client = this.getCloudFormationClient(environment);

    // [step 2] Build parameters for cloudformation command.
    const command = new DeleteStackCommand({StackName: stack.name!});

    // [step 3] Send command and update state.
    return await client.send(command);
  }

  //* Get example parameters of stack.
  getStackParams(stackType: string): {} {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }

  //* Check parameters before building stack.
  checkStackParams(params: {stackType: string; stackParams: object}): boolean {
    return this.getStackServiceByType(params.stackType)?.checkStackParams(
      params.stackParams
    );
  }

  //* Get AWS CloudFormation client.
  private getCloudFormationClient(
    environment: ProjectEnvironment
  ): CloudFormationClient {
    if (environment.awsProfile && environment.awsRegion) {
      return new CloudFormationClient({
        // Get credentials from local credentials file "~/.aws/credentials"
        credentials: fromIni({profile: environment.awsProfile}),
        region: environment.awsRegion,
      });
    } else if (
      environment.awsAccessKeyId &&
      environment.awsSecretAccessKey &&
      environment.awsRegion
    ) {
      return new CloudFormationClient({
        credentials: {
          accessKeyId: environment.awsAccessKeyId,
          secretAccessKey: environment.awsSecretAccessKey,
        },
        region: environment.awsRegion,
      });
    } else {
      throw new BadRequestException('The AWS config is not ready.');
    }
  }

  //* Get CloudFormation template URL.
  private getStackTemplate(stack: InfrastructureStack): string {
    const environment = stack['environment'] as ProjectEnvironment;

    const templatePath = this.getStackServiceByType(
      stack.type
    ).getStackTemplate();

    if (environment.awsRegion && environment.awsRegion.startsWith('cn')) {
      return (
        'https://' +
        environment.s3ForCloudformation +
        '.s3.' +
        environment.awsRegion +
        '.amazonaws.com.cn/' +
        templatePath
      );
    } else {
      return (
        'https://' +
        environment.s3ForCloudformation +
        '.s3.amazonaws.com/' +
        templatePath
      );
    }
  }

  //* Get stack class
  private getStackServiceByType(type: string) {
    switch (type) {
      case CloudFormationStackType.CICD_BUILD:
        return CicdBuild_Stack;
      case CloudFormationStackType.CICD_PIPELINE:
        return CicdPipeline_Stack;
      case CloudFormationStackType.CICD_REPOSITORY:
        return CicdRepository_Stack;
      case CloudFormationStackType.FARGATE:
        return ComputingFargate_Stack;
      case CloudFormationStackType.HIPAA_NETWORK:
        return NetworkHipaa_Stack;
      case CloudFormationStackType.MESSAGE_TRACKER:
        return ProductMessageTracker_Stack;
      default:
        return Null_Stack;
    }
  }
}
