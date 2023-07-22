import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {
  PermissionAction,
  Prisma,
  Role,
  TrustedEntityType,
} from '@prisma/client';
import {UserService} from '../../../microservices/user/user.service';
import {PermissionService} from '../../../microservices/user/permission/permission.service';
import {PERMISSION_KEY} from './authorization.decorator';
import {TokenService} from '../../../toolkit/token/token.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // [step 1] Get required permission.
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: Prisma.ModelName;
      action: PermissionAction;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    // [step 2] Parse JWT.
    const req = context.switchToHttp().getRequest();
    const payload = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(req)
    ) as {
      userId: string;
      sub: string;
    };

    // [step 3] Get user with organization and roles.
    const user = await this.userService.findUniqueOrThrow({
      where: {id: payload.userId},
      include: {roles: true},
    });

    // [step 4-1] Get organization permissions.
    if (user.organizationId) {
      const organizationPermissions = await this.permissionService.findMany({
        where: {
          trustedEntityType: TrustedEntityType.ORGANIZATION,
          trustedEntityId: user.organizationId,
        },
      });

      for (let i = 0; i < organizationPermissions.length; i++) {
        const permission = organizationPermissions[i];
        if (
          permission.resource === requiredPermission.resource &&
          permission.action === requiredPermission.action
        ) {
          return true;
        }
      }
    }

    // [step 4-2] Get roles' permissions.
    const roleIds = user['roles'].map((role: Role) => {
      return role.id;
    });
    if (roleIds) {
      const rolePermissions = await this.permissionService.findMany({
        where: {
          trustedEntityType: TrustedEntityType.ROLE,
          trustedEntityId: {in: roleIds},
        },
      });

      for (let i = 0; i < rolePermissions.length; i++) {
        const permission = rolePermissions[i];
        if (
          permission.resource === requiredPermission.resource &&
          permission.action === requiredPermission.action
        ) {
          return true;
        }
      }
    }

    // [step 4-3] Get user's permissions.
    const userPermissions = await this.permissionService.findMany({
      where: {
        trustedEntityType: TrustedEntityType.USER,
        trustedEntityId: user.id,
      },
    });

    for (let i = 0; i < userPermissions.length; i++) {
      const permission = userPermissions[i];
      if (
        permission.resource === requiredPermission.resource &&
        permission.action === requiredPermission.action
      ) {
        return true;
      }
    }

    return false;
  }
}