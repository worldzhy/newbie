import {SetMetadata} from '@nestjs/common';

// Use @GuardByVerificationCode() for password-local strategy authentication
export const IS_LOGGING_IN_VERIFICATION_CODE_KEY =
  'isLoggingInByVerificationCode';
export const GuardByVerificationCode = () =>
  SetMetadata(IS_LOGGING_IN_VERIFICATION_CODE_KEY, true);
