import {Injectable} from '@nestjs/common';

@Injectable()
export class AwsS3_Stack {
  static getStackParams() {
    return {
      S3BucketName: 'example-bucket',
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
    return ['bucketName', 'bucketArn'];
  }

  static getStackTemplate() {
    return 'aws-quickstart-067174804713/2022171Cj4-new.template8y1d4phaedp';
  }
}
