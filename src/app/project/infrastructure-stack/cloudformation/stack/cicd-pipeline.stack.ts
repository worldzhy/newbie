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
    return 'quickstart-coderepo-and-imagerepo/templates/coderepo-and-imagerepo.template.yaml';
  }
}
