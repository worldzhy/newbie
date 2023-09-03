import {SetMetadata} from '@nestjs/common';

// Use @AccessingRefreshEndpoint() for refresh endpoint authentication
export const IS_ACCESSING_REFRESH_ENDPOINT = 'isAccessingRefreshEndpoint';
export const AccessingRefreshEndpoint = () =>
  SetMetadata(IS_ACCESSING_REFRESH_ENDPOINT, true);
