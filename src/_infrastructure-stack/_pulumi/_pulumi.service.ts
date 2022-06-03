import {Injectable} from '@nestjs/common';
import {
  DestroyResult,
  InlineProgramArgs,
  LocalWorkspace,
  PulumiFn,
  UpResult,
} from '@pulumi/pulumi/automation';
import {InfrastructureStackType} from '@prisma/client';
import {createAwsS3Stack} from './_stack/aws.s3.stack';
import {createAwsVpcStack} from './_stack/aws.vpc.stack';
import {createContainerClusterStack} from './_stack/container.stack';
import {createContainerClusterInVpcStack} from './_stack/container-in-vpc.stack';
import {createDatabaseStack} from './_stack/database.stack';
import {createNetworkStack} from './_stack/network.stack';
import {createServerComputingStack} from './_stack/server.stack';
import {Config} from 'src/_config/_common.config';
import axios from 'axios';

@Injectable()
export class PulumiService {
  public awsRegion = Config.getRegion();
  private pulumiAwsVersion = Config.getPulumiAwsVersion();

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
  async createStack(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ): Promise<UpResult | undefined> {
    // [step 1] Get Pulumi stack program.
    const program: PulumiFn | null = this.getPulumiProgramByStackType(
      stackType,
      stackParams
    );

    // [step 2] Create the stack.
    if (program === null) {
      return undefined;
    }
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program,
    };

    const stack = await LocalWorkspace.createStack(args);
    await stack.workspace.installPlugin('aws', this.pulumiAwsVersion);
    await stack.setConfig('aws:region', {value: this.awsRegion});
    return await stack.up({onOutput: console.log}); // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
  }

  /**
   * Destroy a stack.
   *
   * @param {string} projectName
   * @param {string} stackName
   * @param {InfrastructureStackType} stackType
   * @param {*} stackParams
   * @returns {(Promise<DestroyResult | undefined>)}
   * @memberof PulumiService
   */
  async destroyStack(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType,
    stackParams: any
  ): Promise<DestroyResult | undefined> {
    // [step 1] Get Pulumi stack program.
    const program: PulumiFn | null = this.getPulumiProgramByStackType(
      stackType,
      stackParams
    );

    // [step 2] Destroy the stack.
    if (program === null) {
      return undefined;
    }
    const args: InlineProgramArgs = {
      projectName,
      stackName,
      program,
    };

    const stack = await LocalWorkspace.selectStack(args);
    return await stack.destroy({onOutput: console.log});
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#delete-stack
   *
   * @param {string} pulumiOrgName
   * @param {string} stackType
   * @param {string} stackName
   * @returns
   * @memberof PulumiService
   */
  async deleteStack(
    projectName: string,
    stackName: string,
    stackType: InfrastructureStackType
  ) {
    if (null === this.getPulumiProgramByStackType(stackType, {})) {
      return {err: {message: 'Invalid stack type.'}};
    }

    const url = `https://api.pulumi.com/api/stacks/worldzhy/${projectName}/${stackName}`;
    try {
      const response = await axios.delete(url, {
        maxRedirects: 5,
        headers: {
          Accept: 'application/vnd.pulumi+8',
          'Content-Type': 'application/json',
          Authorization: 'token ' + Config.getPulumiAccessToken(),
        },
      });

      return {
        status: response.status,
        statusText: response.statusText,
        config: response.config,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error(error);
      }
    }
  }

  // :)
  private getPulumiProgramByStackType(
    stackType: InfrastructureStackType,
    stackParams: any
  ) {
    switch (stackType) {
      case InfrastructureStackType.AWS_S3:
        return createAwsS3Stack(stackParams);
      case InfrastructureStackType.AWS_VPC:
        return createAwsVpcStack(stackParams);
      case InfrastructureStackType.ACCOUNT:
        return null;
      case InfrastructureStackType.DATABASE:
        return createDatabaseStack(stackParams);
      case InfrastructureStackType.ELASTIC_CONTAINER_CLUSTER:
        return createContainerClusterStack(stackParams);
      case InfrastructureStackType.ELASTIC_CONTAINER_CLUSTER_IN_VPC:
        return createContainerClusterInVpcStack(stackParams);
      case InfrastructureStackType.ELASTIC_SERVER_CLUSTER:
        return createServerComputingStack(stackParams);
      case InfrastructureStackType.FILE_MANAGER:
        return createAwsS3Stack(stackParams);
      case InfrastructureStackType.NETWORK:
        return createNetworkStack(stackParams);
      case InfrastructureStackType.LOGGER:
        return null;
      case InfrastructureStackType.QUEQUE:
        return null;
      default:
        return null;
    }
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
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#get-stack
   * @param {string} orgName
   * @param {string} projectName
   * @param {string} stackName
   * @returns
   * @memberof PulumiService
   */
  async getStack(orgName: string, projectName: string, stackName: string) {
    const url = `https://api.pulumi.com/api/stacks/${orgName}/${projectName}/${stackName}`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#get-stack-state
   *
   * @param {string} orgName
   * @param {string} projectName
   * @param {string} stackName
   * @returns
   * @memberof PulumiService
   */
  async getStackState(orgName: string, projectName: string, stackName: string) {
    const url = `https://api.pulumi.com/api/stacks/${orgName}/${projectName}/${stackName}/export`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }
  /* End */
}
