import {SetMetadata} from '@nestjs/common';

// export const RESOURCE_KEY = 'resource';
// export const ACTION_KEY = 'action';
// export const RequirePermission = (resource: string, action: string) => {
//   SetMetadata(RESOURCE_KEY, resource);
//   SetMetadata(ACTION_KEY, action);
// };

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (permision: {
  resource: string;
  action: string;
}) => SetMetadata(PERMISSION_KEY, permision);
