import {Injectable} from '@nestjs/common';

@Injectable()
export class Null_Stack {
  static getStackParams() {
    return {};
  }

  static checkStackParams(params: object) {
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
