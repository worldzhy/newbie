import {Injectable} from '@nestjs/common';

@Injectable()
export class Null_Stack {
  static getStackParams() {
    return {};
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

  static getStackProgram = (params: {}, awsConfig: any) => async () => {};
}
