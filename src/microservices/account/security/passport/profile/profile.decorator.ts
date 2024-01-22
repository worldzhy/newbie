import {SetMetadata} from '@nestjs/common';

// Use @GuardByProfile() for custom.profile strategy authentication
export const IS_LOGGING_IN_PROFILE_KEY = 'isLoggingInByProfile';
export const GuardByProfile = () =>
  SetMetadata(IS_LOGGING_IN_PROFILE_KEY, true);
