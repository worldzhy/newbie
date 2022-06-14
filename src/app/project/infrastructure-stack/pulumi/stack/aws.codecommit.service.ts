import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {CommonUtil} from '../../../../../_util/_common.util';
import {PulumiUtil} from '../pulumi.util';

@Injectable()
export class AwsCodecommit_StackService {
  static getStackParams() {
    return {
      repositoryName: 'example-repository',
    };
  }

  static checkStackParams(params: object) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['username', 'password'];
  }

  static getStackProgram =
    (params: {repositoryName: string}, awsRegion: string) => async () => {
      // [step 1] Guard statement.

      // [step 2] Create a repository.
      const uniqueResourceName = 'code-commit';
      const repository = new aws.codecommit.Repository(
        uniqueResourceName,
        {
          repositoryName: params.repositoryName,
          defaultBranch: 'main',
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        cloneUrlHttp: repository.cloneUrlHttp,
        cloneUrlSsh: repository.cloneUrlSsh,
      };
    };
}
