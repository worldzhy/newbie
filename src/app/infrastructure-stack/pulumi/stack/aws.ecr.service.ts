import {Injectable} from '@nestjs/common';
import * as awsx from '@pulumi/awsx';
import {CommonUtil} from '../../../../_util/_common.util';
import {PulumiUtil} from '../pulumi.util';

@Injectable()
export class AwsEcr_StackService {
  static getStackParams() {
    return {
      repositoryName: 'example-repository',
    };
  }

  static getStackProgram =
    (params: {repositoryName: string}, awsRegion: string) => async () => {
      // [step 1] Guard statement.

      // [step 2] Create a repository.
      let uniqueResourceName = 'ecr-' + CommonUtil.randomCode(4);
      const repository = new awsx.ecr.Repository(
        uniqueResourceName,
        {name: params.repositoryName},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName = 'ecr-image-' + CommonUtil.randomCode(4);
      const image = new awsx.ecr.Image(
        uniqueResourceName,
        {repositoryUrl: repository.url},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        repositoryUrl: repository.url,
        imageUrn: image.urn,
      };
    };
}
