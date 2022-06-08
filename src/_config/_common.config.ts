import {Injectable} from '@nestjs/common';

@Injectable()
export class CommonConfig {
  static getJwtSecret = () => {
    if (typeof process.env.JWT_SECRET === 'string') {
      return process.env.JWT_SECRET;
    } else {
      return 'environment variable JWT_SECRET is invalid.';
    }
  };

  static getEnvironment = () => {
    if (typeof process.env.ENVIRONMENT === 'string') {
      return process.env.ENVIRONMENT;
    } else {
      return 'environment variable ENVIRONMENT is invalid.';
    }
  };
}
