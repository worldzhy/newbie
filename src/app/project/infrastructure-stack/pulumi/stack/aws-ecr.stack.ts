import {Injectable} from '@nestjs/common';
import * as awsx from '@pulumi/awsx';
import {PulumiUtil} from '../pulumi.util';

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

  static getStackProgram =
    (params: {repositoryName: string}, awsConfig: any) => async () => {
      // [step 1] Guard statement.

      // [step 2] Create a repository.
      let uniqueResourceName = 'ecr';
      const repository = new awsx.ecr.Repository(
        uniqueResourceName,
        {name: params.repositoryName},
        PulumiUtil.getResourceOptions(awsConfig.region)
      );

      uniqueResourceName = 'ecr-image';
      const image = new awsx.ecr.Image(
        uniqueResourceName,
        {repositoryUrl: repository.url},
        PulumiUtil.getResourceOptions(awsConfig.region)
      );

      return {
        repositoryUrl: repository.url,
        imageUrn: image.urn,
      };
    };
}
