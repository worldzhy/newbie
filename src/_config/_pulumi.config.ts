import {Injectable} from '@nestjs/common';

@Injectable()
export class PulumiConfig {
  static getAwsVersion = () => {
    if (typeof process.env.PULUMI_AWS_VERSION === 'string') {
      return process.env.PULUMI_AWS_VERSION;
    } else {
      return 'environment variable PULUMI_AWS_VERSION is invalid.';
    }
  };

  static getAccessToken = () => {
    if (typeof process.env.PULUMI_ACCESS_TOKEN === 'string') {
      return process.env.PULUMI_ACCESS_TOKEN;
    } else {
      return 'environment variable PULUMI_ACCESS_TOKEN is invalid.';
    }
  };
}
