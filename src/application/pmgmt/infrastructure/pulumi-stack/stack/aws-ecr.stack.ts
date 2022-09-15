import {Injectable} from '@nestjs/common';
import * as awsx from '@pulumi/awsx';
import {getAwsConfig} from '../../../../../_config/_aws.config';
import {buildResourceOptions} from '../pulumi-stack.util';

@Injectable()
export class AwsEcr_Stack {
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
    return ['repositoryUrl', 'imageUrn'];
  }

  static getStackProgram = (params: {repositoryName: string}) => async () => {
    // [step 1] Guard statement.

    // [step 2] Create a repository.
    let uniqueResourceName = 'ecr';
    const repository = new awsx.ecr.Repository(
      uniqueResourceName,
      {name: params.repositoryName},
      buildResourceOptions(getAwsConfig().region!)
    );

    uniqueResourceName = 'ecr-image';
    const image = new awsx.ecr.Image(
      uniqueResourceName,
      {repositoryUrl: repository.url},
      buildResourceOptions(getAwsConfig().region!)
    );

    return {
      repositoryUrl: repository.url,
      imageUrn: image.urn,
    };
  };
}
