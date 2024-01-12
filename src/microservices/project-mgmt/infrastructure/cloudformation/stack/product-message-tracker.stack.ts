import {Injectable} from '@nestjs/common';

@Injectable()
export class ProductMessageTracker_Stack {
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
    return 'quickstart-message-tracker/templates/message-tracker.template.json';
  }
}
