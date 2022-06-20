import {Injectable} from '@nestjs/common';

@Injectable()
export class S3_Stack {
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
    return 'https://s3-external-1.amazonaws.com/cf-templates-1mxwi9sjys7dk-us-east-1/2022171Cj4-new.template8y1d4phaedp';
  }
}
