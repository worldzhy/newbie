import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PermissionModule} from './permission/permission.module';
import {RoleModule} from '../user/role/role.module';

@Module({
  imports: [JwtModule, PermissionModule, RoleModule],
})
export class AuthorizationModule {}
