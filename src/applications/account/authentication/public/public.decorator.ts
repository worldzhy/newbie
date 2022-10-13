import {SetMetadata} from '@nestjs/common';

// Use @Public() for non-authentication
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
