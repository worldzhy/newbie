import {WhereInput} from '@casl/prisma/dist/types/prismaClientBoundTypes';
import {SetMetadata} from '@nestjs/common';
import {PermissionAction, Prisma} from '@prisma/client';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (
  action: PermissionAction,
  resource: Prisma.ModelName,
  fields?: string[],
  conditions?: WhereInput<Prisma.ModelName>
) => SetMetadata(PERMISSION_KEY, {action, resource, fields, conditions});
