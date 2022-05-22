import {Injectable} from '@nestjs/common';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Injectable()
export class Enum {
  static environment = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
  };
}

@Injectable()
export class AwsEnum {
  static pinpointChannel = {
    UNKNOWN: 'unknown',
    EMAIL: 'email',
    SMS: 'sms',
  };

  static pinpointSmsMessageType = {
    TRANSACTIONAL: 'TRANSACTIONAL',
    PROMOTIONAL: 'PROMOTIONAL',
  };
}
