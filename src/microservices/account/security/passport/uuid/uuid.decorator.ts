import {SetMetadata} from '@nestjs/common';

// Use @GuardByUuid() for custom.uuid strategy authentication
export const IS_LOGGING_IN_UUID_KEY = 'isLoggingInByUuid';
export const GuardByUuid = () => SetMetadata(IS_LOGGING_IN_UUID_KEY, true);
