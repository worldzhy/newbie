import {Injectable} from '@nestjs/common';

@Injectable()
export class NetworkHipaa_Stack {
  static getStackParams() {
    return {
      SNSAlarmEmail: 'henry@inceptionpad.com',
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
    return 'quickstart-compliance-hipaa/templates/compliance-hipaa-entrypoint.template.yaml';
  }
}
