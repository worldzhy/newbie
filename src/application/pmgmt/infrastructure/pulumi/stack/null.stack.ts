import {Injectable} from '@nestjs/common';

@Injectable()
export class Pulumi_Null_Stack {
  static getStackParams() {
    return {};
  }

  static checkStackParams(params: {}) {
    console.log(params);
    return false;
  }

  static getStackOutputKeys() {
    return [];
  }

  static getStackProgram = (params: {}) => async () => {
    console.log(params);
  };
}
