import {SetMetadata} from '@nestjs/common';

// Use @LoggingInByJwt() for passport-jwt strategy authentication
export const IS_LOGGING_IN_JWT_KEY = 'isLoggingInByJwt';
export const LoggingInByJwt = () => SetMetadata(IS_LOGGING_IN_JWT_KEY, true);
