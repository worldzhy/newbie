import {SetMetadata} from '@nestjs/common';
import {PermissionAction, PermissionResource} from '@prisma/client';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (
  resource: PermissionResource,
  action: PermissionAction
) => SetMetadata(PERMISSION_KEY, {resource, action});
