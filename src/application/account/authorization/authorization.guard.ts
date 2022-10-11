import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {
  Permission,
  Role,
  RoleToPermission,
  UserToPermission,
  UserToRole,
} from '@prisma/client';
import {UserJwtService} from '../user/jwt/jwt.service';
import {UserService} from '../user/user.service';
import {PERMISSION_KEY} from './authorization.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private userService = new UserService();
  private jwtService = new UserJwtService();

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // [step 1] Get required permission.
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission) {
      return true;
    }

    // [step 2] Parse JWT.
    const req = context.switchToHttp().getRequest();
    const payload = this.jwtService.parseJWT(req.headers.authorization) as {
      userId: string;
      sub: string;
    };

    // [step 3] Get user with permissions.
    const user = await this.userService.findUniqueOrThrow({
      where: {id: payload.userId},
      include: {
        roles: {include: {role: {include: {permissions: true}}}},
        permissions: {include: {permission: true}},
      },
    });

    const userPermissions = user['permissions'] as UserToPermission[];
    for (let i = 0; i < userPermissions.length; i++) {
      const userPermission = userPermissions[i];
      if (
        userPermission['permission'].resource === requiredPermission.resource &&
        userPermission['permission'].action === requiredPermission.action
      ) {
        return true;
      }
    }

    const rolePermissions = user['roles'].flatMap((userRole: UserToRole) => {
      return userRole['role']['permissions'];
    }) as RoleToPermission[];
    for (let i = 0; i < rolePermissions.length; i++) {
      const rolePermission = rolePermissions[i];
      if (
        rolePermission['permission'].resource === requiredPermission.resource &&
        rolePermission['permission'].action === requiredPermission.action
      ) {
        return true;
      }
    }

    for (let i = 0; i < user['roles'].length; i++) {
      const userRole = user['roles'][i] as UserToRole;
      if (
        userRole['role'].name === 'SUPER' ||
        userRole['role'].name === 'SUPER_ADMINISTRATOR'
      ) {
        return true;
      }
    }

    return false;
  }
}
