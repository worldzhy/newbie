import {SetMetadata} from '@nestjs/common';

// Use @NoGuard() for non-authentication
export const IS_PUBLIC_KEY = 'isPublic';
export const NoGuard = () => SetMetadata(IS_PUBLIC_KEY, true);
