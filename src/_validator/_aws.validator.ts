import {Injectable} from '@nestjs/common';
import validator from 'validator';

@Injectable()
export class AwsValidator {
  static verifyRegion(region: string) {
    const pattern =
      /(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\d/g;
    return pattern.test(region);
  }

  /**
   * bucket naming rules - https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
   *
   * @param {string} bucketName
   * @returns
   * @memberof ValidatorAwsService
   */
  static verifyS3Bucketname(bucketName: string) {
    // [step 1] S3 bucket name length must be larger than 2 and smaller than 64.
    if (!validator.isLength(bucketName, {min: 3, max: 63})) {
      return false;
    }

    // [step 2] Uppercase letters are not allowed.
    if (RegExp('[A-Z]').test(bucketName)) {
      return false;
    }

    // [step 3] 'xn--' is reserved prefix and '-s3alias' is reserved suffix by AWS.
    if (bucketName.startsWith('xn--') || bucketName.endsWith('-s3alias')) {
      return false;
    }

    // [step 4] For special characters, only '-' can be contained in the username.
    return validator.isAlphanumeric(bucketName, 'en-US', {ignore: '[-]'});
  }
}
