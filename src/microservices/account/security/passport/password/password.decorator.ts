import {SetMetadata} from '@nestjs/common';

// Use @GuardByPassword() for password-local strategy authentication
export const IS_LOGGING_IN_PASSWORD_KEY = 'isLoggingInByPassword';
export const GuardByPassword = () =>
  SetMetadata(IS_LOGGING_IN_PASSWORD_KEY, true);
