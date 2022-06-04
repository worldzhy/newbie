import * as aws from '@pulumi/aws';
import {CommonUtil} from '../../../_util/_common.util';
import {PulumiUtil} from '../_pulumi.util';

export const createAwsCodeCommitStack =
  (params: {repositoryName: string}) => async () => {
    // [step 1] Guard statement.

    // [step 2] Create a repository.
    const uniqueResourceName = 'code-commit-' + CommonUtil.randomCode(4);
    const repository = new aws.codecommit.Repository(
      uniqueResourceName,
      {
        repositoryName: params.repositoryName,
      },
      PulumiUtil.resourceOptions
    );

    return {
      cloneUrlHttp: repository.cloneUrlHttp,
      cloneUrlSsh: repository.cloneUrlSsh,
    };
  };
