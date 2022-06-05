import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {CommonUtil} from '../../../_util/_common.util';
import {PulumiUtil} from '../_pulumi.util';

@Injectable()
export class AwsCodecommit_StackService {
  static getStackParams() {
    return {
      repositoryName: 'example-repository',
    };
  }

  static getStackProgram = (params: {repositoryName: string}) => async () => {
    // [step 1] Guard statement.

    // [step 2] Create a repository.
    const uniqueResourceName = 'code-commit-' + CommonUtil.randomCode(4);
    const repository = new aws.codecommit.Repository(
      uniqueResourceName,
      {
        repositoryName: params.repositoryName,
        defaultBranch: 'main',
      },
      PulumiUtil.resourceOptions
    );

    return {
      cloneUrlHttp: repository.cloneUrlHttp,
      cloneUrlSsh: repository.cloneUrlSsh,
    };
  };
}
