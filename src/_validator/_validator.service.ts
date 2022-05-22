import {Injectable} from '@nestjs/common';
import validator from 'validator';

@Injectable()
export class ValidatorService {
  /**
   * Verify Account information:
   * [1] password
   * [2] username
   * [3] email
   * [4] phone
   */

  verifyPassword(password: string): boolean {
    return validator.isStrongPassword(password);
  }

  verifyUsername(username: string): boolean {
    // [step 1] username length must be larger than 4 and smaller than 64.
    if (!validator.isLength(username, {min: 5, max: 63})) {
      return false;
    }

    // [step 2] username must not be email or phone to make sure email and phone can represent unique account.
    if (
      validator.isEmail(username) ||
      validator.isMobilePhone(username, ['en-US', 'zh-CN'])
    ) {
      return false;
    }

    // [step 3] For special characters, only '-' and '_'  can be contained in the username.
    return validator.isAlphanumeric(username, 'en-US', {ignore: '[-_]'});
  }

  verifyEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  verifyPhone(phone: string): boolean {
    return validator.isMobilePhone(phone, ['en-US', 'zh-CN']);
  }

  /**
   * Verify AWS information:
   * [1] bucket naming rules - https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
   */

  verifyS3Bucketname(bucketName: string) {
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

  /**
   * Verify Project information:
   */
  verifyProjectName(projectName: string) {
    // [step 1] Project name length must be larger than 2 and smaller than 64.
    if (!validator.isLength(projectName, {min: 3, max: 63})) {
      return false;
    }

    // [step 2] For special characters, only '-' can be contained in the username.
    return validator.isAlphanumeric(projectName, 'en-US', {ignore: '[-_ ]'});
  }
}
