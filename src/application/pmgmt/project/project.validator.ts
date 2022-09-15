import validator from 'validator';

/**
 * Verify Project information:
 */
export function verifyProjectName(projectName: string) {
  // [step 1] Project name length must be larger than 2 and smaller than 64.
  if (!validator.isLength(projectName, {min: 3, max: 63})) {
    return false;
  }

  // [step 2] For special characters, only '-' can be contained in the username.
  return validator.isAlphanumeric(projectName, 'en-US', {ignore: '[-_ ]'});
}

export function verifyEmail(email: string): boolean {
  return validator.isEmail(email);
}
