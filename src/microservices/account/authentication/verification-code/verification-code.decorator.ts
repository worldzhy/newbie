import {SetMetadata} from '@nestjs/common';

// Use @LoggingInByVerificationCode() for password-local strategy authentication
export const IS_LOGGING_IN_VERIFICATION_CODE_KEY =
  'isLoggingInByVerificationCode';
export const LoggingInByVerificationCode = () =>
  SetMetadata(IS_LOGGING_IN_VERIFICATION_CODE_KEY, true);
