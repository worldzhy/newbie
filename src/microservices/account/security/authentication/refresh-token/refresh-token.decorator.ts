import {SetMetadata} from '@nestjs/common';

// Use @RefreshingAccessToken() for refresh endpoint authentication
export const IS_REFRESHING_ACCESS_TOKEN = 'isRefreshingAccessToken';
export const RefreshingAccessToken = () =>
  SetMetadata(IS_REFRESHING_ACCESS_TOKEN, true);
