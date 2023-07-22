import {Global, Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserProfileController} from './profile/profile.controller';
import {RoleController} from './role/role.controller';
import {PermissionController} from './permission/permission.controller';
import {UserService} from './user.service';
import {UserProfileService} from './profile/profile.service';
import {UserTokenService} from './token/token.service';
import {RoleService} from './role/role.service';
import {PermissionService} from './permission/permission.service';

@Global()
@Module({
  controllers: [
    UserController,
    UserProfileController,
    RoleController,
    PermissionController,
  ],
  providers: [
    UserService,
    UserProfileService,
    UserTokenService,
    RoleService,
    PermissionService,
  ],
  exports: [
    UserService,
    UserProfileService,
    UserTokenService,
    RoleService,
    PermissionService,
  ],
})
export class UserModule {}
