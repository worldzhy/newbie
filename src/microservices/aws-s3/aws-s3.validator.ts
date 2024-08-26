import validator from 'validator';

export function verifyRegion(region: string) {
  const pattern =
    /(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\d/g;
  return pattern.test(region);
}

/**
 * bucket naming rules - https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
 *
 * @param {string} name
 * @returns
 * @memberof ValidatorAwsService
 */
export function verifyS3BucketName(name: string) {
  // [step 1] S3 bucket name length must be larger than 2 and smaller than 64.
  if (!validator.isLength(name, {min: 3, max: 63})) {
    return false;
  }

  // [step 2] Uppercase letters are not allowed.
  if (RegExp('[A-Z]').test(name)) {
    return false;
  }

  // [step 3] 'xn--' is reserved prefix and '-s3alias' is reserved suffix by AWS.
  if (name.startsWith('xn--') || name.endsWith('-s3alias')) {
    return false;
  }

  // [step 4] For special characters, only '-' can be contained in the username.
  return validator.isAlphanumeric(name, 'en-US', {ignore: '[-]'});
}
