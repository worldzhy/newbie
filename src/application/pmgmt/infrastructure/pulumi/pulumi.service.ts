import {BadRequestException, Injectable} from '@nestjs/common';
import axios from 'axios';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  UpResult,
} from '@pulumi/pulumi/automation';
import {InfrastructureStack, ProjectEnvironment} from '@prisma/client';
import {AwsCloudfront_Stack} from './stack/aws-cloudfront.stack';
import {AwsIamUser_Stack} from './stack/aws-iam-user.stack';
import {AwsRds_Stack} from './stack/aws-rds.stack';
import {AwsS3_Stack} from './stack/aws-s3.stack';
import {AwsSqs_Stack} from './stack/aws-sqs.stack';
import {AwsVpc_Stack} from './stack/aws-vpc.stack';
import {AwsWaf_Stack} from './stack/aws-waf.stack';
import {Pulumi_Null_Stack} from './stack/null.stack';
import {ConfigService} from '@nestjs/config';

export const PulumiStackType = {
  AWS_CLOUDFRONT: 'AWS_CLOUDFRONT',
  AWS_CODE_COMMIT: 'AWS_CODE_COMMIT',
  AWS_ECR: 'AWS_ECR',
  AWS_ECS: 'AWS_ECS',
  AWS_EKS: 'AWS_EKS',
  AWS_IAM_USER: 'AWS_IAM_USER',
  AWS_RDS: 'AWS_RDS',
  AWS_S3: 'AWS_S3',
  AWS_SQS: 'AWS_SQS',
  AWS_VPC: 'AWS_VPC',
  AWS_WAF: 'AWS_WAF',
  COMPUTING_FARGATE: 'COMPUTING_FARGATE',
};

@Injectable()
export class PulumiStackService {
  constructor(private readonly configService: ConfigService) {}

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
   */
  async createResources(stack: InfrastructureStack): Promise<UpResult> {
    // [step 1] Create or select pulumi stack.
    const environment = stack['environment'] as ProjectEnvironment;
    const args: InlineProgramArgs = {
      projectName:
        stack['environment']['project'].name.replace(/ /g, '_') +
        '_' +
        stack['environment'].name.replace(/ /g, '_'),
      stackName: stack.name!,
      program: this.getStackProgramByType(stack.type, stack.params),
    };
    const pulumiStack = await LocalWorkspace.createOrSelectStack(args);

    // [step 2] Configure pulumi stack.
    await pulumiStack.workspace.installPlugin(
      'aws',
      this.configService.get<string>('application.pulumi.awsVersion')!
    );
    if (environment.awsProfile && environment.awsRegion) {
      await pulumiStack.setAllConfig({
        'aws:profile': {value: environment.awsProfile},
        'aws:region': {value: environment.awsRegion},
      });
    } else if (
      environment.awsAccessKeyId &&
      environment.awsSecretAccessKey &&
      environment.awsRegion
    ) {
      await pulumiStack.setAllConfig({
        'aws:accessKey': {value: environment.awsAccessKeyId},
        'aws:secretKey': {value: environment.awsSecretAccessKey},
        'aws:region': {value: environment.awsRegion},
      });
    } else {
      throw new BadRequestException('The AWS config is not ready.');
    }

    // [step 3] Create resources.
    return await pulumiStack.up({onOutput: console.log});
  }

  //* Destroy resources
  async destroyResources(stack: InfrastructureStack): Promise<DestroyResult> {
    // [step 1] Get pulumi stack.
    const args: InlineProgramArgs = {
      projectName:
        stack['environment']['project'].name.replace(/ /g, '_') +
        '_' +
        stack['environment'].name.replace(/ /g, '_'),
      stackName: stack.name!,
      program: async () => {},
    };
    const pulumiStack = await LocalWorkspace.selectStack(args);

    // [step 2] Destroy resources and remove the stack information from Pulumi.
    // https://www.pulumi.com/docs/reference/service-rest-api/#delete-stack
    const destroyResult = await pulumiStack.destroy({onOutput: console.log});
    await pulumiStack.workspace.removeStack(stack.name!);

    return destroyResult;
  }

  /**
   * Sometimes, destroying stack failed makes the Pulumi stack is not able to be removed.
   * Then, it's time to use this function.
   */
  async forceDeleteOnPulumi(params: {
    pulumiOrganization: string;
    pulumiProject: string;
    pulumiStack: string;
  }) {
    const url = `https://api.pulumi.com/api/stacks/${params.pulumiOrganization}/${params.pulumiProject}/${params.pulumiStack}`;
    return await axios.delete(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization:
          'token ' +
          this.configService.get<string>('application.pulumi.accessToken'),
      },
      params: {
        force: true,
      },
    });
  }

  //* @See https://www.pulumi.com/docs/reference/service-rest-api/#list-stacks
  async getStacks(stackProjectName: string) {
    const url = `https://api.pulumi.com/api/user/stacks?project=${stackProjectName}`;

    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization:
          'token ' +
          this.configService.get<string>('application.pulumi.accessToken'),
      },
    });
  }

  //* Get example parameters of stack.
  getStackParams(stackType: string) {
    return this.getStackServiceByType(stackType)?.getStackParams();
  }

  //* Check parameters before building stack.
  checkStackParams(params: {stackType: string; stackParams: any}) {
    return this.getStackServiceByType(params.stackType).checkStackParams(
      params.stackParams
    );
  }

  //* Get Pulumi program for stack-up.
  private getStackProgramByType(stackType: string, stackParams: any) {
    return this.getStackServiceByType(stackType).getStackProgram(stackParams);
  }

  //* Get stack class
  private getStackServiceByType(type: string) {
    switch (type) {
      case PulumiStackType.AWS_CLOUDFRONT:
        return AwsCloudfront_Stack;
      case PulumiStackType.AWS_ECR:
        return Pulumi_Null_Stack;
      case PulumiStackType.AWS_ECS:
        return Pulumi_Null_Stack;
      case PulumiStackType.AWS_EKS:
        return Pulumi_Null_Stack;
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
        return Pulumi_Null_Stack;
      default:
        return Pulumi_Null_Stack;
    }
  }

  /* End */
}
