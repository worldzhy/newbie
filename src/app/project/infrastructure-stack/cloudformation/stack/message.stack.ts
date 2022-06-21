import {Injectable} from '@nestjs/common';

@Injectable()
export class Message_Stack {
  static getStackParams() {
    return {
      DatabaseHost:
        'postgres-1.cmkxbdo0yf63.rds.cn-northwest-1.amazonaws.com.cn',
      DatabasePort: '5432',
      DatabaseMasterUsername: 'postgres',
      DatabaseMasterUserPassword: 'postgres',
      DatabaseName: 'postgres',
      SESIdentityARN: '',
      FromAddress: 'henry@inceptionpad.com',
      LambdaCodeS3BucketName: 'aws-quickstart-077767357755',
      PinpointEventProcessorLambdaCodeArchiveName: '',
      AlarmLambdaCodeArchiveName: '',
      MessageShooterLambdaCodeArchiveName: '',
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
    return ['EmailQueueUrl'];
  }

  static getStackTemplate() {
    return 'https://cf-templates-1mxwi9sjys7dk-us-east-1.s3.amazonaws.com/quickstart-compliance-hipaa/templates/compliance-hipaa-entrypoint.template.yaml';
  }
}
