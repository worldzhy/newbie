import {Injectable} from '@nestjs/common';

@Injectable()
export class FargateCicd_Solution_Stack {
  static getStackParams() {
    return {
      ContainerPort: 3000,
      MaxContainerCount: 200,
      MinContainerCount: 2,
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
    return [
      'RepoUrl',
      'LoadBalancerUrl',
      'CodePipelineName',
      'CodePipelineUrl',
    ];
  }

  static getStackTemplate() {
    return 'https://aws-quickstart-077767357755.s3.cn-northwest-1.amazonaws.com.cn/quickstart-nestjs-fargate-cicd/templates/fargate-cicd.template.yaml';
  }
}
