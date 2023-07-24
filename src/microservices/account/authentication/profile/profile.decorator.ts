import {SetMetadata} from '@nestjs/common';

// Use @LoggingInByProfile() for custom.profile strategy authentication
export const IS_LOGGING_IN_PROFILE_KEY = 'isLoggingInByProfile';
export const LoggingInByProfile = () =>
  SetMetadata(IS_LOGGING_IN_PROFILE_KEY, true);
