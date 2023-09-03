import {SetMetadata} from '@nestjs/common';

// Use @LoggingIn() for all login requests
export const IS_LOGGING_IN = 'isLoggingIn';
export const LoggingIn = () => SetMetadata(IS_LOGGING_IN, true);
