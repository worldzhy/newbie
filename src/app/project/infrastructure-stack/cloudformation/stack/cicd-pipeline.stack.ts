import {Injectable} from '@nestjs/common';

@Injectable()
export class CicdPipeline_Stack {
  static getStackParams() {
    return {
      repositoryName: 'example-repo',
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
    return ['CodeCloneUrlHttp', 'ImageUrlHttp'];
  }

  static getStackTemplate() {
    return 'https://aws-quickstart-077767357755.s3.cn-northwest-1.amazonaws.com.cn/quickstart-coderepo-and-imagerepo/templates/coderepo-and-imagerepo.template.yaml';
  }
}
