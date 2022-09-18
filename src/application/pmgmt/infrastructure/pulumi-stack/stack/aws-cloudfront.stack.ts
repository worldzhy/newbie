import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {getAwsConfig} from '../../../../../_config/_aws.config';
import {buildResourceOptions} from '../../../../../toolkits/utilities/pulumi.util';

@Injectable()
export class AwsCloudfront_Stack {
  private awsConfig = getAwsConfig();

  static getStackParams() {
    return {
      repositoryName: 'example-repository',
    };
  }

  static checkStackParams(params: {}) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['username', 'password'];
  }

  static getStackProgram = (params: {repositoryName: string}) => async () => {
    // [step 1] Guard statement.

    // [step 2] Create a repository.
    const uniqueResourceName = 'code-commit';
    const repository = new aws.codecommit.Repository(
      uniqueResourceName,
      {
        repositoryName: params.repositoryName,
        defaultBranch: 'main',
      },
      buildResourceOptions(getAwsConfig().region!)
    );

    return {
      cloneUrlHttp: repository.cloneUrlHttp,
      cloneUrlSsh: repository.cloneUrlSsh,
    };
  };
}
