import {Injectable} from '@nestjs/common';
import {InlineProgramArgs, LocalWorkspace} from '@pulumi/pulumi/automation';
import {Config} from 'src/_common/_common.config';
import axios from 'axios';

@Injectable()
export class BaseProgram {
  private awsRegion = Config.getRegion();
  private pulumiAwsVersion = Config.getPulumiAwsVersion();
  private pulumiProgram: () => Promise<object>;
  private pulumiStackName = 'development';

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#list-stacks
   *
   * @returns
   * @memberof InfrastructureService
   */
  async listStacks() {
    const url = 'https://api.pulumi.com/api/user/stacks';
    return await axios.get(url, {
      timeout: 5000,
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
   * @param {string} pulumiOrgName
   * @param {string} pulumiStackType
   * @param {string} pulumiStackName
   * @returns
   * @memberof InfrastructureService
   */
  async getStack(
    pulumiOrgName: string,
    pulumiStackType: string,
    pulumiStackName: string
  ) {
    const url = `https://api.pulumi.com/api/stacks/${pulumiOrgName}/${pulumiStackType}/${pulumiStackName}`;
    return await axios.get(url, {
      timeout: 5000,
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
   * @param {string} pulumiOrgName
   * @param {string} pulumiStackType
   * @param {string} pulumiStackName
   * @returns
   * @memberof InfrastructureService
   */
  async getStackState(
    pulumiOrgName: string,
    pulumiStackType: string,
    pulumiStackName: string
  ) {
    const url = `https://api.pulumi.com/api/stacks/${pulumiOrgName}/${pulumiStackType}/${pulumiStackName}/export`;
    return await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }

  /**
   * Set pulumi program. This function is best called in the constructor of the subclass.
   *
   * @param {() => Promise<object>} f
   * @memberof InfrastructureService
   */
  initPulumiProgram(f: () => Promise<object>) {
    this.pulumiProgram = f;
  }

  setStackName(name: string) {
    this.pulumiStackName = name;
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
   * @memberof BaseProgram
   */
  async start() {
    const args: InlineProgramArgs = {
      projectName: this.constructor.name,
      stackName: this.pulumiStackName,
      program: this.pulumiProgram,
    };

    const stack = await LocalWorkspace.createOrSelectStack(args);
    await stack.workspace.installPlugin('aws', this.pulumiAwsVersion);
    await stack.setConfig('aws:region', {value: this.awsRegion});
    return await stack.up({onOutput: console.log}); // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
  }

  /**
   * Destroy a stack.
   *
   * @returns
   * @memberof BaseProgram
   */
  async destroy() {
    const args: InlineProgramArgs = {
      projectName: this.constructor.name,
      stackName: this.pulumiStackName,
      program: this.pulumiProgram,
    };

    const stack = await LocalWorkspace.selectStack(args);
    return await stack.destroy({onOutput: console.log});
  }

  /* End */
}
