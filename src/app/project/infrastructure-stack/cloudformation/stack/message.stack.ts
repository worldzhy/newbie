import {Injectable} from '@nestjs/common';

@Injectable()
export class Message_Stack {
  static getStackParams() {
    return {
      AWSConfigARN:
        'arn:aws:iam::067174804713:role/aws-service-role/config.amazonaws.com/AWSServiceRoleForConfig',
      SNSAlarmEmail: 'henry@inceptionpad.com',
      QSS3BucketName: 'cf-templates-1mxwi9sjys7dk-us-east-1',
      QSS3BucketRegion: 'us-east-1',
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
    return [];
  }

  static getStackTemplate() {
    return 'https://cf-templates-1mxwi9sjys7dk-us-east-1.s3.amazonaws.com/quickstart-compliance-hipaa/templates/compliance-hipaa-entrypoint.template.yaml';
  }
}
