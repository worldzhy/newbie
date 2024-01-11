import {SetMetadata} from '@nestjs/common';

// Use @LoggingIn() for all login requests
export const IP_ATTEMPTS_LIMITER = 'ipAttemptsLimiter';
export const IpAttemptsLimiter = () => SetMetadata(IP_ATTEMPTS_LIMITER, true);
