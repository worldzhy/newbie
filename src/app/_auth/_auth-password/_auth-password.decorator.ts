import {SetMetadata} from '@nestjs/common';

// Use @LoggingInByPassword() for password-local strategy authentication
export const IS_LOGGING_IN_PASSWORD_KEY = 'isLoggingInByPassword';
export const LoggingInByPassword = () =>
  SetMetadata(IS_LOGGING_IN_PASSWORD_KEY, true);
