import {SetMetadata} from '@nestjs/common';

// Use @LoggingInByUuid() for custom.uuid strategy authentication
export const IS_LOGGING_IN_UUID_KEY = 'isLoggingInByUuid';
export const LoggingInByUuid = () => SetMetadata(IS_LOGGING_IN_UUID_KEY, true);
