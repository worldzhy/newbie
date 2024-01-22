import {SetMetadata} from '@nestjs/common';

// Use @GuardByRefreshToken() for refresh endpoint authentication
export const IS_REFRESHING_ACCESS_TOKEN = 'isRefreshingAccessToken';
export const GuardByRefreshToken = () =>
  SetMetadata(IS_REFRESHING_ACCESS_TOKEN, true);
