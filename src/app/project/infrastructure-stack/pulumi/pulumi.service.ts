import {Injectable} from '@nestjs/common';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
} from '@pulumi/pulumi/automation';
import {InfrastructureStackType} from '@prisma/client';
import {PulumiConfig} from 'src/_config/_pulumi.config';
import axios from 'axios';
import {AwsCloudfront_Stack} from './stack/aws.cloudfront.stack';
import {AwsCodecommit_Stack} from './stack/aws.codecommit.stack';
import {AwsEcr_Stack} from './stack/aws.ecr.stack';
import {AwsEcs_Stack} from './stack/aws.ecs.stack';
import {AwsIamUser_Stack} from './stack/aws.iam-user.stack';
import {AwsRds_Stack} from './stack/aws.rds.stack';
import {AwsS3_Stack} from './stack/aws.s3.stack';
import {AwsSqs_Stack} from './stack/aws.sqs.stack';
import {AwsVpc_Stack} from './stack/aws.vpc.stack';
import {Hipaa_Stack} from './stack/hipaa.stack';
import {AwsWaf_Stack} from './stack/aws.waf.stack';

@Injectable()
export class PulumiService {
  private pulumiAwsVersion = PulumiConfig.getAwsVersion();
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
    await stack.workspace.installPlugin('aws', this.pulumiAwsVersion);
    await stack.setAllConfig({
      'aws:profile': {value: this.awsProfile},
      'aws:accessKey': {value: this.awsAccessKey},
      'aws:secretKey': {value: this.awsSecretKey},
      'aws:region': {value: this.awsRegion},
    });

    try {
      return await stack.up({onOutput: console.log}); // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
    } catch (error) {
      return error;
    }
  }

  /**
   * Destroy a stack.
   *
   * @param {string} projectName
   * @param {string} stackName
   * @returns {Promise<DestroyResult>}
   * @memberof PulumiService
   */
  async destroy(
    projectName: string,
    stackName: string
  ): Promise<DestroyResult> {
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program: async () => {},
    };

    const stack = await LocalWorkspace.selectStack(args);
    return await stack.destroy({onOutput: console.log});
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#delete-stack
   *
   * @param {string} projectName
   * @param {string} stackName
   * @memberof PulumiService
   */
  async delete(projectName: string, stackName: string) {
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program: async () => {},
    };

    const stack = await LocalWorkspace.selectStack(args);
    await stack.workspace.removeStack(stack.name);
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#list-stacks
   *
   * @returns
   * @memberof PulumiService
   */
  async getStacks(projectName: string) {
    const url = `https://api.pulumi.com/api/user/stacks?project=${projectName}`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + PulumiConfig.getAccessToken(),
      },
    });
  }

  /**
   * Get stack outputs.
   *
   * @param {string} projectName
   * @param {string} stackName
   * @param {InfrastructureStackType} stackType
   * @memberof PulumiService
   */
  async getStackOutputs(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType
  ) {
    // [step 1] Create stack args.
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program: async () => {},
    };

    // [step 2] Get stack.
    const stack = await LocalWorkspace.selectStack(args);
    await stack.workspace.installPlugin('aws', this.pulumiAwsVersion);
    await stack.setAllConfig({
      'aws:region': {value: this.awsRegion},
      'aws:profile': {value: projectName},
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
   * Get stack class
   *
   * @param {InfrastructureStackType} type
   * @returns
   * @memberof InfrastructureStackService
   */
  private getStackServiceByType(type: InfrastructureStackType) {
    switch (type) {
      case InfrastructureStackType.AWS_CLOUDFRONT:
        return AwsCloudfront_Stack;
      case InfrastructureStackType.AWS_CODE_COMMIT:
        return AwsCodecommit_Stack;
      case InfrastructureStackType.AWS_ECR:
        return AwsEcr_Stack;
      case InfrastructureStackType.AWS_ECS:
        return AwsEcs_Stack;
      case InfrastructureStackType.AWS_EKS:
        return AwsEcs_Stack;
      case InfrastructureStackType.AWS_IAM_USER:
        return AwsIamUser_Stack;
      case InfrastructureStackType.AWS_RDS:
        return AwsRds_Stack;
      case InfrastructureStackType.AWS_S3:
        return AwsS3_Stack;
      case InfrastructureStackType.AWS_SQS:
        return AwsSqs_Stack;
      case InfrastructureStackType.AWS_VPC:
        return AwsVpc_Stack;
      case InfrastructureStackType.AWS_WAF:
        return AwsWaf_Stack;
      case InfrastructureStackType.HIPAA:
        return Hipaa_Stack;
    }
  }

  private getStackProgramByType(
    stackType: InfrastructureStackType,
    stackParams: any
  ) {
    return this.getStackServiceByType(stackType).getStackProgram(
      stackParams,
      this.awsRegion
    );
  }

  /* End */
}
